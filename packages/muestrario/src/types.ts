import type { CSSProperties } from 'react';
import type { Placement, Position } from '@npmegar/plomada/react';
import type { Group } from './filter.js';
import type { ComboboxLabels } from './labels.js';
import type {
    AnchorProps, ButtonProps, GroupLabelProps, GroupProps, InputProps, ListboxProps, OptionProps, StatusProps,
} from './props.js';
import type { AsyncStatus, Loader } from './useAsyncItems.js';
import type { VirtualOptions } from './useVirtual.js';

export interface UseComboboxOptions<T> {
    getLabel: (item: T) => string;
    getKey?: (item: T) => string;
    items?: readonly T[];
    load?: Loader<T>;
    filter?: ((item: T, query: string) => boolean) | false;
    groupBy?: (item: T) => string;
    isDisabled?: (item: T) => boolean;
    multiple?: boolean;
    value?: T | null;
    defaultValue?: T | null;
    onChange?: (value: T | null) => void;
    onSelect?: (item: T) => void;
    selectBehavior?: 'fill' | 'command';
    closeOnSelect?: boolean;
    values?: readonly T[];
    defaultValues?: readonly T[];
    onValuesChange?: (values: T[]) => void;
    freeText?: boolean;
    onCreate?: (text: string) => T | null | undefined;
    virtual?: VirtualOptions;
    minChars?: number;
    debounce?: number;
    openOnFocus?: boolean;
    position?: boolean;
    placement?: Placement;
    offset?: number;
    labels?: Partial<ComboboxLabels>;
}

export interface VirtualOption<T> {
    item: T;
    index: number;
    style: CSSProperties;
}

export interface SizerProps {
    'aria-hidden': true;
    style: CSSProperties;
}

export interface UseCombobox<T> {
    open: boolean;
    inputValue: string;
    items: readonly T[];
    groups: Group<T>[] | null;
    activeIndex: number;
    value: T | null;
    values: readonly T[];
    status: AsyncStatus;
    statusText: string;
    createText: string | null;
    virtualItems: VirtualOption<T>[] | null;
    position: Position | null;
    setOpen(open: boolean): void;
    setInputValue(text: string): void;
    select(item: T): void;
    clear(): void;
    getAnchorProps(): AnchorProps;
    getInputProps(): InputProps;
    getListboxProps(): ListboxProps;
    getOptionProps(item: T, index: number): OptionProps;
    getCreateProps(): OptionProps;
    getSizerProps(): SizerProps;
    getGroupProps(group: Group<T>): GroupProps;
    getGroupLabelProps(group: Group<T>): GroupLabelProps;
    getRemoveProps(item: T): ButtonProps;
    getClearProps(): ButtonProps;
    getStatusProps(): StatusProps;
}
