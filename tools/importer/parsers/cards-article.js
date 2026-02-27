/* eslint-disable */
/* global WebImporter */

/**
 * Parser for Cards-Article block variant
 *
 * Source: https://turbotax.intuit.com/tax-tools/tax-articles-and-tips/
 * Base Block: cards
 * Variant: cards-article
 *
 * Block Structure:
 * - Row 1: Block name header ("Cards-Article")
 * - Row 2-N: [image | content] per card
 *
 * Source HTML Patterns:
 * Cards are in a grid (div[class*="Grid-md:grid-cols-5"] or flex row for featured).
 * Each card has:
 * - <picture> with image
 * - Category link: <a> inside the card pointing to category
 * - Title link: <a> with article title
 * - Optional description text in <p>
 *
 * Output: 2-column table rows - [image, textContent] where textContent includes
 * bold category, bold title, optional description, and "Read full article" link.
 *
 * Generated: 2026-02-27
 */
export default function parse(element, { document }) {
  // Identify card items within the container
  // VALIDATED: Source HTML uses different container patterns for different card types

  // Pattern 1: Featured cards (Pod-based layout)
  // EXTRACTED: Found <div class="Pod-pod-a63da3f"> in source HTML
  let cardItems = Array.from(element.querySelectorAll('[class*="Pod-pod"]'));

  // Pattern 2: Grid-based cards (recent articles in 5-column grid)
  // EXTRACTED: Found <div class="... GridItem-order-e422a5a ..."> in source HTML
  if (cardItems.length === 0) {
    cardItems = Array.from(element.querySelectorAll('[class*="GridItem-order"]'));
  }

  // Fallback: direct children divs that contain images
  if (cardItems.length === 0) {
    cardItems = Array.from(element.querySelectorAll(':scope > div')).filter(
      (div) => div.querySelector('img'),
    );
  }

  const cells = [];

  cardItems.forEach((card) => {
    // Extract image
    // VALIDATED: All card types use <picture><img> pattern
    const img = card.querySelector('img');
    if (!img) return;

    // Build content cell
    const contentContainer = document.createElement('div');

    // Extract category link
    // EXTRACTED: Category links point to category pages, e.g. <a href="/tax-tips/family/">
    // Pattern: <a><h4 class="body03 font-medium text-pepper80">Category</h4></a>
    const categoryLinkEl = card.querySelector('a[class*="Link-font-demi-link"] h4');
    const categoryHeading = card.querySelector('h2[class*="body03"], h2.body03');

    if (categoryLinkEl) {
      const p = document.createElement('p');
      const a = categoryLinkEl.closest('a').cloneNode(true);
      const strong = document.createElement('strong');
      strong.textContent = categoryLinkEl.textContent.trim();
      a.textContent = '';
      a.appendChild(strong);
      p.appendChild(a);
      contentContainer.appendChild(p);
    } else if (categoryHeading) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = categoryHeading.textContent.trim();
      p.appendChild(strong);
      contentContainer.appendChild(p);
    }

    // Extract title
    // EXTRACTED: Featured has <h4 class="headline06 font-medium">
    // EXTRACTED: Recent/Blog has second <a><p class="body02 font-demi text-blueberry80">
    const titleH4 = card.querySelector('h4[class*="headline06"]');
    const allLinks = card.querySelectorAll('a[class*="Link-font-demi-link"]');

    if (titleH4 && !categoryLinkEl) {
      // Featured pattern: h4 title not inside a category link
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = titleH4.textContent.trim();
      p.appendChild(strong);
      contentContainer.appendChild(p);
    } else if (categoryLinkEl && allLinks.length > 1) {
      // Recent/Blog: the second link is the article title link
      const titleA = allLinks[1];
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = titleA.textContent.trim();
      p.appendChild(strong);
      contentContainer.appendChild(p);
    }

    // Extract optional description
    // EXTRACTED: Featured has <p class="pb-16 body03 font-regular">
    const descParagraphs = card.querySelectorAll('p[class*="body03"][class*="font-regular"]');
    descParagraphs.forEach((desc) => {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      if (p.textContent) {
        contentContainer.appendChild(p);
      }
    });

    // Extract "Read full article" CTA link
    // EXTRACTED: <a><p class="body02 font-text-weight-inherit">Read full article</p></a>
    const ctaLinks = card.querySelectorAll('a[class*="Link-font-demi-link"]');
    const lastLink = ctaLinks.length > 0 ? ctaLinks[ctaLinks.length - 1] : null;
    if (lastLink) {
      const ctaText = lastLink.textContent.trim();
      // Only add CTA if it looks like a "Read full article" type link
      if (ctaText && ctaText.toLowerCase().includes('read')) {
        const p = document.createElement('p');
        const a = lastLink.cloneNode(true);
        a.textContent = ctaText;
        p.appendChild(a);
        contentContainer.appendChild(p);
      }
    }

    // Build the row: [image, content]
    cells.push([img.cloneNode(true), contentContainer]);
  });

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards-Article', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
