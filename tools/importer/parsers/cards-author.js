/* eslint-disable */
/* global WebImporter */

/**
 * Parser for Cards-Author block variant
 *
 * Source: https://turbotax.intuit.com/tax-tools/tax-articles-and-tips/
 * Base Block: cards
 * Variant: cards-author
 *
 * Block Structure:
 * - Row 1: Block name header ("Cards-Author")
 * - Row 2-N: [image | content] per author card
 *
 * Source HTML Pattern:
 * <div class="Grid-xl:grid-cols-4">
 *   <div class="GridItem-order-e422a5a">
 *     <picture><img src="author-photo.png" alt="Author Name"></picture>
 *     <span class="headline06 font-medium text-black">Author Name</span>
 *     <p class="text-secondary">Attorney</p>
 *     <a class="Link-font-demi-link-84adaca" href="/authors/author-name/">
 *       <p class="body02 font-demi">More about Author Name</p>
 *     </a>
 *   </div>
 * </div>
 *
 * Output: 2-column table rows - [image, textContent] where textContent has
 * bold author name, role, and link.
 *
 * Generated: 2026-02-27
 */
export default function parse(element, { document }) {
  // EXTRACTED: Found <div class="... GridItem-order-e422a5a ..."> items in Grid-xl:grid-cols-4
  let cardItems = Array.from(element.querySelectorAll('[class*="GridItem-order"]'));

  // Fallback: direct child divs that contain images
  if (cardItems.length === 0) {
    cardItems = Array.from(element.querySelectorAll(':scope > div')).filter(
      (div) => div.querySelector('img'),
    );
  }

  const cells = [];

  cardItems.forEach((card) => {
    // Extract author photo
    // VALIDATED: Author cards use <picture><img> pattern with author headshot
    const img = card.querySelector('img');
    if (!img) return;

    // Build content cell
    const contentContainer = document.createElement('div');

    // Extract author name
    // EXTRACTED: Found <span class="headline06 font-medium text-black">Author Name</span>
    const authorName = card.querySelector('span[class*="headline06"], span[class*="font-medium"]');
    if (authorName) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = authorName.textContent.trim();
      p.appendChild(strong);
      contentContainer.appendChild(p);
    }

    // Extract role text (e.g., "Attorney", "CPA")
    // EXTRACTED: Found <p class="text-secondary">Attorney</p>
    const roleEl = card.querySelector('p[class*="text-secondary"]');
    if (roleEl) {
      const p = document.createElement('p');
      p.textContent = roleEl.textContent.trim();
      contentContainer.appendChild(p);
    }

    // Extract "More about..." link
    // EXTRACTED: Found <a href="/authors/author-name/"><p class="body02 font-demi">More about Author Name</p></a>
    const moreLink = card.querySelector('a[href*="/authors/"]');
    if (!moreLink) {
      // Fallback: any link with "More about" text
      const allLinks = card.querySelectorAll('a[class*="Link-font-demi-link"]');
      const fallbackLink = Array.from(allLinks).find(
        (a) => a.textContent.toLowerCase().includes('more about'),
      );
      if (fallbackLink) {
        const p = document.createElement('p');
        const a = fallbackLink.cloneNode(true);
        a.textContent = fallbackLink.textContent.trim();
        p.appendChild(a);
        contentContainer.appendChild(p);
      }
    } else {
      const p = document.createElement('p');
      const a = moreLink.cloneNode(true);
      a.textContent = moreLink.textContent.trim();
      p.appendChild(a);
      contentContainer.appendChild(p);
    }

    // Build the row: [image, content]
    cells.push([img.cloneNode(true), contentContainer]);
  });

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards-Author', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
