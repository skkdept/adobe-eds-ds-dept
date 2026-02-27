/* eslint-disable */
/* global WebImporter */

/**
 * Parser for Cards-Calculator block variant
 *
 * Source: https://turbotax.intuit.com/tax-tools/tax-articles-and-tips/
 * Base Block: cards
 * Variant: cards-calculator
 *
 * Block Structure:
 * - Row 1: Block name header ("Cards-Calculator")
 * - Row 2-N: [icon image | content] per calculator card
 *
 * Source HTML Pattern:
 * <div class="Grid-md:grid-cols-3 Grid-grid-rows-fr1">
 *   <div class="GridItem-order-e422a5a">
 *     <picture><img src="icon.png" alt=""></picture>
 *     <h4 class="headline06 font-medium">Tax Bracket Calculator</h4>
 *     <p class="body03 font-regular">Calculate your tax bracket...</p>
 *     <a class="Link-font-demi-link-84adaca" href="/tax-tools/calculators/...">
 *       <p class="body03 font-text-weight-inherit">Get started</p>
 *     </a>
 *   </div>
 * </div>
 *
 * Output: 2-column table rows - [image, textContent] where textContent has
 * bold title, description, and link.
 *
 * Generated: 2026-02-27
 */
export default function parse(element, { document }) {
  // EXTRACTED: Found <div class="... GridItem-order-e422a5a ..."> items in Grid-grid-rows-fr1
  let cardItems = Array.from(element.querySelectorAll('[class*="GridItem-order"]'));

  // Fallback: direct child divs that contain images
  if (cardItems.length === 0) {
    cardItems = Array.from(element.querySelectorAll(':scope > div')).filter(
      (div) => div.querySelector('img'),
    );
  }

  const cells = [];

  cardItems.forEach((card) => {
    // Extract icon image
    // VALIDATED: Calculator cards have small icon images
    const img = card.querySelector('img');
    if (!img) return;

    // Build content cell
    const contentContainer = document.createElement('div');

    // Extract calculator name
    // EXTRACTED: Found <h4 class="headline06 font-medium">Tax Bracket Calculator</h4>
    const titleEl = card.querySelector('h4[class*="headline06"], h4');
    if (titleEl) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = titleEl.textContent.trim();
      p.appendChild(strong);
      contentContainer.appendChild(p);
    }

    // Extract description
    // EXTRACTED: Found <p class="mb-20 body03 font-regular">Calculate your tax bracket...</p>
    const descParagraphs = card.querySelectorAll('p[class*="body03"][class*="font-regular"]');
    descParagraphs.forEach((desc) => {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      if (p.textContent) {
        contentContainer.appendChild(p);
      }
    });

    // Extract "Get started" CTA link
    // EXTRACTED: Found <a class="Link-font-demi-link-84adaca"><p>Get started</p></a>
    const ctaLink = card.querySelector('a[class*="Link-font-demi-link"]');
    if (ctaLink) {
      const p = document.createElement('p');
      const a = ctaLink.cloneNode(true);
      a.textContent = ctaLink.textContent.trim();
      p.appendChild(a);
      contentContainer.appendChild(p);
    }

    // Build the row: [icon, content]
    cells.push([img.cloneNode(true), contentContainer]);
  });

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards-Calculator', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
