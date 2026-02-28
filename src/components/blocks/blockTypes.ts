export type EditorFieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'url' | 'image';

export type EditorField = {
  key: string;
  label: string;
  type: EditorFieldType;
  placeholder?: string;
  min?: number;
  max?: number;
};

export type BlockDefinition = {
  type: string;
  label: string;
  description?: string;
  defaultProps: Record<string, unknown>;
  fields: EditorField[];
};
