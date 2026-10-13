# @ghegar/buzon

Headless file dropzone for React. It validates what is dropped, not just what the file dialog lets
through: type (`accept` syntax), size, count, duplicates and your own rule, and it reports every
rejection with machine-readable codes. Files accumulate (`multiple`) or replace each other, the drag
state does not flicker over child elements, and image previews are created on demand and revoked for
you. It ships no styles: only state, ARIA and `data-*` attributes.

```bash
npm install @ghegar/buzon
```

```tsx
import { describeAccept } from '@ghegar/buzon';
import { useDropzone } from '@ghegar/buzon/react';

const ACCEPT = 'image/png,image/jpeg,.pdf';

function Uploader({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
    const zone = useDropzone({ files, onChange, accept: ACCEPT, multiple: true, maxFiles: 5, maxSize: 2 * 1024 * 1024 });
    return (
        <>
            <div {...zone.getRootProps()}>
                <input {...zone.getInputProps()} />
                Drop files or click ({describeAccept(ACCEPT, 'en')})
            </div>
            {zone.rejections.map((r) => <p key={r.file.name}>{r.file.name}: {r.codes.join(', ')}</p>)}
            {zone.files.map((file) => (
                <figure key={file.name}>
                    <img src={zone.previewUrl(file) ?? ''} alt={file.name} />
                    <button {...zone.getRemoveProps(file)}>×</button>
                </figure>
            ))}
        </>
    );
}
```

Style it through `[data-dragging]`, `[data-drag="accept|reject|unknown"]`, `[data-disabled]` and
`[data-full]`. `dragStatus` is a best guess from the MIME types the browser exposes while dragging;
extension rules can only be checked on drop, so they yield `unknown`.

## Options

| Option | Default | |
|---|---|---|
| `accept` | anything | `'.pdf,image/*,text/csv'` or an array |
| `maxSize`, `minSize` | | Bytes |
| `multiple` | `false` | Accumulate; otherwise a new file replaces the old one |
| `maxFiles` | | With `multiple`; extra files are rejected with `count` |
| `allowDuplicates` | `false` | Same name, size and `lastModified` is a duplicate |
| `validate(file, current)` | | Return a message to reject with `custom` |
| `files`, `onChange` | | Controlled when `files` is passed |
| `onReject` | | Rejections of each batch |
| `disabled` | `false` | |
| `labels` | `{ remove: 'Quitar' }` | Used by `getRemoveProps` |
| `paste` | `false` | `true`: pasted files while the zone has focus; `'document'`: anywhere on the page |
| `preventDocumentDrop` | `true` | Files dropped outside the zone do not make the browser open them |

Rejection codes, in check order: `type`, `size`, `duplicate`, `custom`, `count`. Uploading is up to you.

## Without React

`createDropzone(options)`, `validateFiles`, `parseAccept`, `matchesAccept`, `judgeDrag` and
`describeAccept` are exported from `@ghegar/buzon`.

## License

AGPL-3.0-only
