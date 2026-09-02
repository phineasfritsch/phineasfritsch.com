/**
 * The contact address, as raw HTML with Cloudflare's opt-out markers around it.
 *
 * Scrape Shield rewrites every mailto on the site into a /cdn-cgi/l/email-protection
 * stub that only JavaScript decodes — so on a site whose whole argument is that it
 * reads without JavaScript, the address rendered as "[email protected]", which looks
 * like an unfilled template placeholder rather than a privacy feature, and the stub
 * URL 404s. These markers are Cloudflare's documented opt-out.
 *
 * It has to be @html: Svelte strips markup comments from a production build, so the
 * markers cannot be written inline. The strings are static, with no interpolation.
 *
 * This does not replace the dashboard toggle in B6, which is the clean fix. It is the
 * half that does not need the owner. prod.edge-intact reports whether it worked.
 */
export const ADDRESS = 'contact@phineasfritsch.com';

const off = '<!--email_off-->';
const on = '<!--/email_off-->';

/** The address as a mailto link. */
export const emailLink = (text: string = ADDRESS) =>
	`${off}<a href="mailto:${ADDRESS}">${text}</a>${on}`;

/** The address as plain text, still shielded from the rewrite. */
export const emailText = () => `${off}${ADDRESS}${on}`;
