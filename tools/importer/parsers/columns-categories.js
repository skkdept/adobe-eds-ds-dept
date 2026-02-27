/* eslint-disable */
/* global WebImporter */

/**
 * Parser for Columns-Categories block variant
 *
 * Source: https://turbotax.intuit.com/tax-tools/tax-articles-and-tips/
 * Base Block: columns
 * Variant: columns-categories
 *
 * Block Structure:
 * - Row 1: Block name header ("Columns-Categories")
 * - Row 2: Single row with 4 columns [col1 | col2 | col3 | col4]
 *   Each column contains bold heading and category links
 *
 * Source HTML Pattern:
 * <div class="Grid-grid-{hash} Grid-md:grid-cols-4-424283f">
 *   <div class="GridItem-order-e422a5a">
 *     <p class="mb-12 body02 font-medium">Column Heading</p>
 *     <a class="Link-font-demi-link-84adaca mb-4" href="...">
 *       <p class="body03 font-demi">Link Text</p>
 *     </a>
 *     ...
 *   </div>
 *   <!-- 3 more column divs -->
 * </div>
 *
 * Output: Single row with 4 columns - [col1, col2, col3, col4] where each
 * has bold heading and links.
 *
 * Generated: 2026-02-27
 */
export default function parse(element, { document }) {
  // EXTRACTED: Found direct child divs with GridItem-order class
  const columnDivs = element.querySelectorAll(':scope > div[class*="GridItem-order"]');

  if (columnDivs.length === 0) return;

  // Build a single row with all columns
  const row = [];

  columnDivs.forEach((colDiv) => {
    const columnContainer = document.createElement('div');

    // Extract column heading
    // EXTRACTED: Found <p class="mb-12 body02 font-medium">Home & family tax tips</p>
    // Also check for <h4> or <strong> elements
    const heading = colDiv.querySelector(
      'p[class*="body02"][class*="font-medium"], h4, strong',
    );
    if (heading) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = heading.textContent.trim();
      p.appendChild(strong);
      columnContainer.appendChild(p);
    }

    // Extract category links
    // EXTRACTED: Found <a class="Link-font-demi-link-84adaca mb-4"><p class="body03 font-demi">Family</p></a>
    const links = colDiv.querySelectorAll('a[class*="Link-font-demi-link"]');
    links.forEach((link) => {
      const p = document.createElement('p');
      const a = link.cloneNode(true);
      a.textContent = link.textContent.trim();
      p.appendChild(a);
      columnContainer.appendChild(p);
    });

    row.push(columnContainer);
  });

  // Build cells array: single row with all columns
  const cells = [row];

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns-Categories', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
