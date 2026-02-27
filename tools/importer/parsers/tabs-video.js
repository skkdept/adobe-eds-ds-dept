/* eslint-disable */
/* global WebImporter */

/**
 * Parser for Tabs-Video block variant
 *
 * Source: https://turbotax.intuit.com/tax-tools/tax-articles-and-tips/
 * Base Block: tabs
 * Variant: tabs-video
 *
 * Block Structure:
 * - Row 1: Block name header ("Tabs-Video")
 * - Row 2-N: [tab label | tab content] per tab
 *
 * Source HTML Pattern:
 * <div class="idsTSTabs">
 *   <div class="Tabs-tabsList-19d25b3">
 *     <button id="idsTab-{id}" class="Tabs-tabButton-49b612f">
 *       <div><span><strong>TAB LABEL</strong></span></div>
 *     </button>
 *   </div>
 *   <div id="idsTab-{id}-tabPanel" class="Tabs-tabPanel-073f769">
 *     <h2>Heading</h2>
 *     <a href="https://youtube.com/..."><p>Browse all tax videos</p></a>
 *     <div><iframe src="https://www.youtube.com/embed/?playlist=..."></iframe></div>
 *   </div>
 * </div>
 *
 * Output: 2-column table rows - [tabLabel, tabContent] where tabContent has
 * bold heading, link, and YouTube URL.
 *
 * Generated: 2026-02-27
 */
export default function parse(element, { document }) {
  // EXTRACTED: Found <div class="Tabs-tabsList-19d25b3"> containing tab buttons
  const tabButtons = element.querySelectorAll('button[class*="Tabs-tabButton"]');

  // EXTRACTED: Found <div class="Tabs-tabPanel-073f769"> for each tab's content
  const tabPanels = element.querySelectorAll('div[class*="Tabs-tabPanel"]');

  const cells = [];

  tabButtons.forEach((button, index) => {
    // Extract tab label
    // EXTRACTED: Found <strong class="Typography-medium-d5186b7">TAB LABEL</strong>
    const strong = button.querySelector('strong');
    let labelText = strong ? strong.textContent.trim() : button.textContent.trim();

    // Normalize label from ALL CAPS to Title Case
    if (labelText === labelText.toUpperCase() && labelText.length > 1) {
      labelText = labelText
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    // Get corresponding panel
    const panel = tabPanels[index];
    if (!panel) return;

    // Build tab content
    const contentContainer = document.createElement('div');

    // Extract heading
    // EXTRACTED: Found <h2 class="headline03 font-regular">
    const heading = panel.querySelector('h2, h3');
    if (heading) {
      const p = document.createElement('p');
      const b = document.createElement('strong');
      b.textContent = heading.textContent.trim();
      p.appendChild(b);
      contentContainer.appendChild(p);
    }

    // Extract browse link
    // EXTRACTED: Found <a href="https://youtube.com/turbotax"><p>Browse all tax videos</p></a>
    const browseLink = panel.querySelector('a[href*="youtube"]');
    if (browseLink) {
      const p = document.createElement('p');
      const a = browseLink.cloneNode(true);
      a.textContent = browseLink.textContent.trim();
      p.appendChild(a);
      contentContainer.appendChild(p);
    }

    // Extract YouTube embed URL
    // EXTRACTED: Found <iframe src="https://www.youtube.com/embed/?playlist=...">
    const iframe = panel.querySelector('iframe[src*="youtube"]');
    if (iframe) {
      const src = iframe.getAttribute('src') || '';
      // Extract first video ID from playlist parameter
      const playlistMatch = src.match(/playlist=([^&,]+)/);
      if (playlistMatch) {
        const videoId = playlistMatch[1];
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = videoUrl;
        a.textContent = videoUrl;
        p.appendChild(a);
        contentContainer.appendChild(p);
      } else {
        // Fallback: use the iframe src directly
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = src;
        a.textContent = src;
        p.appendChild(a);
        contentContainer.appendChild(p);
      }
    }

    cells.push([labelText, contentContainer]);
  });

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Tabs-Video', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
