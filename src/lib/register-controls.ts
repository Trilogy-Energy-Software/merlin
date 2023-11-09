import { HtmlControl } from './html-control';
import { TextControl } from './text-control';
import { TextInput } from './text-input';

customElements.define('text-control', TextControl);
customElements.define('text-input', TextInput, { extends: 'input' });
customElements.define('context-control', HtmlControl);