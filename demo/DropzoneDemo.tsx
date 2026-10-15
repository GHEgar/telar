import { useState } from 'react';
import { describeAccept, type FileRejection, type RejectionCode } from '@ghegar/buzon';
import { useDropzone } from '@ghegar/buzon/react';
import { Close } from 'tesela/react';

const MB = 1024 * 1024;
const IMAGES = 'image/png,image/jpeg,image/webp';

const REASONS: Record<RejectionCode, string> = {
    type: 'type not allowed',
    size: 'larger than 2 MB',
    count: 'over the file limit',
    duplicate: 'already in the list',
    custom: 'failed validation',
};

const describe = (rejection: FileRejection): string => `${rejection.file.name}: ${rejection.codes.map((code) => REASONS[code]).join(', ')}`;

const Images = () => {
    const [files, setFiles] = useState<File[]>([]);
    const zone = useDropzone({ files, onChange: setFiles, accept: IMAGES, multiple: true, maxFiles: 3, maxSize: 2 * MB, paste: 'document' });
    return (
        <section className="card">
            <h2>Images, up to 3</h2>
            <div className="dropzone" data-testid="images" {...zone.getRootProps()}>
                <input data-testid="images-input" {...zone.getInputProps()} />
                <strong>{zone.full ? 'No room for more' : 'Upload your images'}</strong>
                <span>Click, drag or paste with Ctrl+V ({describeAccept(IMAGES)}, up to 2 MB)</span>
            </div>
            {zone.rejections.length > 0 && (
                <ul className="errors" role="alert">
                    {zone.rejections.map((rejection) => <li key={rejection.file.name}>{describe(rejection)}</li>)}
                </ul>
            )}
            <ul className="thumbs">
                {zone.files.map((file) => (
                    <li key={`${file.name}-${file.lastModified}`}>
                        <img src={zone.previewUrl(file) ?? ''} alt={file.name} />
                        <button className="remove" {...zone.getRemoveProps(file)}><Close size={14} /></button>
                    </li>
                ))}
            </ul>
        </section>
    );
};

const Document = () => {
    const zone = useDropzone({ accept: '.pdf' });
    const file = zone.files[0];
    return (
        <section className="card">
            <h2>A PDF</h2>
            <div className="dropzone" data-testid="pdf" {...zone.getRootProps()}>
                <input data-testid="pdf-input" {...zone.getInputProps()} />
                <strong>Upload your file</strong>
                <span>Allowed format {describeAccept('.pdf')}; a new one replaces the previous</span>
            </div>
            {zone.rejections.length > 0 && <p className="errors" role="alert">{zone.rejections.map(describe).join('. ')}</p>}
            {file && (
                <p className="file" data-testid="pdf-file">
                    {file.name}
                    <button className="remove" {...zone.getRemoveProps(file)}><Close size={14} /></button>
                </p>
            )}
        </section>
    );
};

export const DropzoneDemo = () => (
    <>
        <Images />
        <Document />
    </>
);
