import { useState } from 'react';
import { describeAccept, type FileRejection, type RejectionCode } from '@ghegar/buzon';
import { useDropzone } from '@ghegar/buzon/react';

const MB = 1024 * 1024;
const IMAGES = 'image/png,image/jpeg,image/webp';

const REASONS: Record<RejectionCode, string> = {
    type: 'tipo no permitido',
    size: 'pesa más de 2 MB',
    count: 'excede el máximo de archivos',
    duplicate: 'ya está en la lista',
    custom: 'no pasó la validación',
};

const describe = (rejection: FileRejection): string => `${rejection.file.name}: ${rejection.codes.map((code) => REASONS[code]).join(', ')}`;

const Images = () => {
    const [files, setFiles] = useState<File[]>([]);
    const zone = useDropzone({ files, onChange: setFiles, accept: IMAGES, multiple: true, maxFiles: 3, maxSize: 2 * MB });
    return (
        <section className="card">
            <h2>Imágenes, hasta 3</h2>
            <div className="dropzone" data-testid="images" {...zone.getRootProps()}>
                <input data-testid="images-input" {...zone.getInputProps()} />
                <strong>{zone.full ? 'Ya no caben más' : 'Sube tus imágenes'}</strong>
                <span>Da clic o arrastra dentro de este recuadro ({describeAccept(IMAGES)}, hasta 2 MB)</span>
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
                        <button className="remove" {...zone.getRemoveProps(file)}>✕</button>
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
            <h2>Un PDF</h2>
            <div className="dropzone" data-testid="pdf" {...zone.getRootProps()}>
                <input data-testid="pdf-input" {...zone.getInputProps()} />
                <strong>Sube tu archivo</strong>
                <span>Formato permitido {describeAccept('.pdf')}; el nuevo reemplaza al anterior</span>
            </div>
            {zone.rejections.length > 0 && <p className="errors" role="alert">{zone.rejections.map(describe).join('. ')}</p>}
            {file && (
                <p className="file" data-testid="pdf-file">
                    {file.name}
                    <button className="remove" {...zone.getRemoveProps(file)}>✕</button>
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
