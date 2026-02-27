/* eslint-disable */
/* global WebImporter */

/**
 * Transformer for TurboTax website cleanup
 * Purpose: Remove non-content elements (header, footer, nav, scripts, styles,
 *          tracking, cookie banners, Intuit-specific UI)
 * Applies to: turbotax.intuit.com (all templates)
 * Generated: 2026-02-27
 *
 * SELECTORS EXTRACTED FROM:
 * - Captured DOM during migration of https://turbotax.intuit.com/tax-tools/tax-articles-and-tips/
 * - cleaned.html from page scraping phase
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove cookie/consent banners
    // EXTRACTED: Intuit sites use various consent/cookie banner patterns
    WebImporter.DOMUtils.remove(element, [
      '[class*="cookie"]',
      '[class*="consent"]',
      '[id*="cookie"]',
      '[id*="consent"]',
      '[class*="CookieBanner"]',
      '[class*="ConsentBanner"]',
    ]);

    // Remove navigation header
    // EXTRACTED: Found <header class="w-full Header-header-ef98178 sticky top-0 z-30">
    WebImporter.DOMUtils.remove(element, [
      'header',
      'nav',
    ]);

    // Remove footer
    // EXTRACTED: Footer is typically loaded dynamically on TurboTax pages
    WebImporter.DOMUtils.remove(element, [
      'footer',
    ]);

    // Remove scripts and styles
    // These are not content and should never be imported
    WebImporter.DOMUtils.remove(element, [
      'script',
      'style',
      'link[rel="stylesheet"]',
      'noscript',
    ]);

    // Remove tracking/analytics elements
    // EXTRACTED: Found iframes for tracking pixels and data-analytics attributes
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      '[data-analytics]',
    ]);

    // Remove Intuit-specific hosted UI elements
    // EXTRACTED: Found Intuit Identity Service (IUS) modal containers
    WebImporter.DOMUtils.remove(element, [
      '#ius-hosted-ui',
      '.ius-hosted-ui-container',
    ]);

    // Remove skip-to-content link
    // EXTRACTED: Found <a href="#mainContent" class="Header-skipLink-7ad2311">
    WebImporter.DOMUtils.remove(element, [
      'a[href="#mainContent"]',
      'a.Header-skipLink-7ad2311',
    ]);

    // Remove carousel navigation elements (glide arrows, bullets)
    // EXTRACTED: Found <div class="navigation__container index-navigation__container-5d4c7a0">
    // These are interactive carousel controls, not content
    WebImporter.DOMUtils.remove(element, [
      '.navigation__container',
      '.glide__arrowContainer',
      '.glide__bulletsContainer',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove any remaining non-content elements that survived parsing
    WebImporter.DOMUtils.remove(element, [
      'noscript',
      'link',
      'source',
      '[class*="Footer"]',
    ]);

    // Clean up data attributes used for tracking
    // EXTRACTED: Found data-theme="turbotax" and various data-* attributes
    const allElements = element.querySelectorAll('*');
    allElements.forEach((el) => {
      el.removeAttribute('data-theme');
      el.removeAttribute('data-track');
      el.removeAttribute('data-testid');
      el.removeAttribute('data-analytics');
    });
  }
}
