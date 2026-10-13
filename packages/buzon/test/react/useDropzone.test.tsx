import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDropzone, type UseDropzoneOptions } from '@ghegar/buzon/react';
import { makeFile } from '../core/helpers.js';

const Zone = (options: UseDropzoneOptions) => {
    const zone = useDropzone(options);
    return (
        <div>
            <div data-testid="zone" {...zone.getRootProps()}>
                <input data-testid="input" {...zone.getInputProps()} />
                Drop
            </div>
            <ul>
                {zone.files.map((file) => (
                    <li key={file.name}>
                        {file.name}
                        <button {...zone.getRemoveProps(file)}>x</button>
                    </li>
                ))}
            </ul>
            <p data-testid="rejected">{zone.rejections.map((rejection) => rejection.codes.join('+')).join(',')}</p>
        </div>
    );
};

const transfer = (files: File[]) => ({
    files,
    items: files.map((file) => ({ kind: 'file', type: file.type })),
    types: ['Files'],
});

afterEach(cleanup);

describe('useDropzone', () => {
    it('accepts files from the input and clears its value', () => {
        const onChange = vi.fn();
        render(<Zone multiple accept="image/*" onChange={onChange} />);
        const input = screen.getByTestId('input') as HTMLInputElement;
        expect(input.hidden).toBe(true);
        fireEvent.change(input, { target: { files: [makeFile('a.png', 'image/png'), makeFile('b.txt', 'text/plain')] } });
        expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ name: 'a.png' })]);
        expect(screen.getByText('a.png')).toBeTruthy();
        expect(screen.getByTestId('rejected').textContent).toBe('type');
    });

    it('tracks drag state and drops', () => {
        render(<Zone accept="image/*" />);
        const zone = screen.getByTestId('zone');
        const files = [makeFile('a.pdf', 'application/pdf')];
        fireEvent.dragEnter(zone, { dataTransfer: transfer(files) });
        expect(zone.dataset.dragging).toBe('true');
        expect(zone.dataset.drag).toBe('reject');
        fireEvent.drop(zone, { dataTransfer: transfer(files) });
        expect(zone.dataset.dragging).toBeUndefined();
        expect(screen.getByTestId('rejected').textContent).toBe('type');
    });

    it('opens the dialog from the keyboard', () => {
        render(<Zone />);
        const input = screen.getByTestId('input') as HTMLInputElement;
        const click = vi.spyOn(input, 'click');
        fireEvent.keyDown(screen.getByTestId('zone'), { key: 'Enter' });
        expect(click).toHaveBeenCalledTimes(1);
    });

    it('works controlled and removes with a labelled button', () => {
        const Controlled = () => {
            const [files, setFiles] = useState<File[]>([makeFile('one.png', 'image/png')]);
            return <Zone multiple files={files} onChange={setFiles} />;
        };
        render(<Controlled />);
        fireEvent.click(screen.getByRole('button', { name: 'Quitar one.png' }));
        expect(screen.queryByText('one.png')).toBeNull();
    });
});
