import { Meta } from '@storybook/react';
import { HtmlMarkdown as HtmlMarkdownComp } from '../src/src-v2/components/html-markdown';

export default {
  title: 'Components/Markdown',
  component: HtmlMarkdownComp,
} as Meta;

const MarkdownTemplate = args => <HtmlMarkdownComp {...args} />;

export const Markdown = MarkdownTemplate.bind({});

Markdown.args = {
  children:
    'The `/print.json` endpoint on the Playtronics API (`api.playtronics.com`) contains a\nreflected XSS vulnerability via the `title` parameter.\n\n### Steps to reproduce\n1. Generate an API key for any user/permission on the Playtronics API\n - Send victim to an URL with the reflected XSS payload embedded:\n`https://api.playtronics.com/print.json?api_key=ENTER_API_KEY_HERE&title=<script>\n  alert(/xss!/);\n</script>`\n\n### Proof of Concept\nIt is possible to hide the reflected XSS payload inside another web page to make the\nattack more stealthy. Here\'s a way to do it with an iframe:\n\n```\n<iframe src="https://api.playtromnics.com/print.json?api_key=ENTER_API_KEY_HERE&title=<script>\n  alert(/xss!/);\n</script>" />\n```\n\n### Remediaton\n* Ensure the HTTP responses from the API are always `Content-Type: application/json`\n* Properly sanitize the user input for the `title` parameter in the `print.json` endpoint\nand escape potentially dangerous characters, such as HTML tags and JavaScript\n\n## Impact\n\nAn attacker can execute arbitrary JavaScript on api.playtronics.com, potentially\nescalating the impact by capturing the API token of the victim.',
};
