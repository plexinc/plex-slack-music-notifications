declare module BlockKit {
  interface BlockKitPlainTextInputElement {
    focus_on_load?: boolean;
    placeholder: BlockKitPlainTextElement;
    type: "plain_text_input";
    action_id: string;
  }

  interface BlockKitStaticSelectInputElementBase {
    type: "static_select";
    action_id: string;
    focus_on_load?: boolean;
    placeholder?: BlockKitPlainTextElement;
  }

  interface BlockKitOption {
    text: BlockKitPlainTextElement;
    value: string;
  }

  type BlockKitOptionGroup = {
    label: BlockKitPlainTextElement;
    options: BlockKitOption;
  };

  interface BlockKitStaticSelectInputElementWithOptionGroups
    extends BlockKitStaticSelectInputElementBase {
    option_groups: readonly BlockKitOptionGroup[];
  }

  interface BlockKitStaticSelectInputElementWithOptions
    extends BlockKitStaticSelectInputElementBase {
    options: BlockKitOption;
  }

  type BlockKitInputElement =
    | BlockKitPlainTextInputElement
    | BlockKitStaticSelectInputElement;

  interface BlockKitInputBlock {
    type: "input";
    dispatch_action?: boolean;
    element: BlockKitInputElement;
    label: BlockKitPlainTextElement;
  }

  interface BlockKitPlainTextElement {
    type: "plain_text";
    text: string;
    emoji?: boolean;
  }

  interface BlockKitMarkdownTextElement {
    type: "mrkdwn";
    text: string;
    emoji?: boolean;
  }

  type BlockKitTextElement =
    | BlockKitMarkdownTextElement
    | BlockKitPlainTextElement;

  type BlockKitElement = BlockKitPlainTextElement;

  interface BlockKitHeaderBlock {
    type: "header";
    text: BlockKitTextElement;
  }

  interface BlockKitContextBlock {
    type: "context";
    elements: readonly BlockKitElement[];
  }

  interface BlockKitAccessoryButton {
    type: 'button';
    text: BlockKitPlainTextElement;
    style?: 'primary' | 'danger';
    value?: string;
    url?: string;
    action_id: string;
  }

  type BlockKitAccessory = BlockKitAccessoryButton;

  interface BlockKitSectionBlock {
    type: "section";
    text: BlockKitTextElement;
    accessory?: BlockKitAccessory;
  }

  type BlockKitBlock =
    | BlockKitHeaderBlock
    | BlockKitContextBlock
    | BlockKitInputBlock
    | BlockKitSectionBlock;

  interface Kit {
    replace_original?: boolean;
    blocks: readonly BlockKitBlock[];
  }

  // Actions

  interface StaticSelectBlockActionValue {
    type: "static_select";
    selected_option?: {
      value: string;
    };
  }
  
  interface PlainTextBlockActionValue {
    type: "plain_text";
    value: string;
  }
  
  type BlockActionValue =
    | PlainTextBlockActionValue
    | StaticSelectBlockActionValue;  
}
