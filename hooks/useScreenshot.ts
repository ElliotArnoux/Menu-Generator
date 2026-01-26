
import { useCallback } from 'react';
import html2canvas from 'html2canvas';

/**
 * Hook to handle generating a screenshot of the week view.
 * Encapsulates the DOM manipulation required for html2canvas.
 */
export const useScreenshot = (
    currentView: string,
    setCurrentView: (view: 'planner' | 'recipes' | 'rules') => void,
    isDarkMode: boolean,
    activeWeekName: string
) => {

    const handleScreenshot = useCallback(async () => {
        // Ensure we are on the planner view before capturing
        if (currentView !== 'planner') {
            setCurrentView('planner');
            // Allow React render cycle to complete
            await new Promise(r => setTimeout(r, 200));
        }
    
        const element = document.getElementById('week-view-container');
        if (!element) return;
    
        try {
            const canvas = await html2canvas(element, {
                backgroundColor: isDarkMode ? '#111827' : '#ffffff',
                scale: 2, // High resolution
                useCORS: true,
                logging: false,
                onclone: (clonedDoc) => {
                    // Pre-processing the cloned DOM to ensure it looks good in a static image
                    // This includes expanding grids, hiding scrollbars, and removing clamps
                    const container = clonedDoc.getElementById('week-view-container');
                    if (container) {
                        container.style.height = 'auto';
                        container.style.minHeight = 'auto';
                        container.style.width = '1800px'; 
                        container.style.overflow = 'visible';
                        container.style.display = 'flex';
                        container.style.flexDirection = 'column';
    
                        const daysGrid = container.querySelector('.flex.gap-4.min-w-max, .md\\:grid-cols-7');
                        if (daysGrid) {
                            (daysGrid as HTMLElement).style.display = 'grid';
                            (daysGrid as HTMLElement).style.gridTemplateColumns = 'repeat(7, 1fr)';
                            (daysGrid as HTMLElement).style.width = '100%';
                            (daysGrid as HTMLElement).style.gap = '16px';
                            (daysGrid as HTMLElement).style.padding = '24px';
                            
                            daysGrid.querySelectorAll('.w-\\[300px\\], md\\:w-auto').forEach(card => {
                                (card as HTMLElement).style.width = '100%';
                                (card as HTMLElement).style.height = 'auto';
                            });
                        }
    
                        const footer = container.querySelector('.sticky.bottom-0');
                        if (footer) {
                            (footer as HTMLElement).style.position = 'relative';
                            (footer as HTMLElement).style.bottom = 'auto';
                            (footer as HTMLElement).style.marginTop = '40px';
                            (footer as HTMLElement).style.boxShadow = 'none';
                            (footer as HTMLElement).style.borderTop = '2px solid #ccc';
                            (footer as HTMLElement).style.background = isDarkMode ? '#111827' : '#ffffff';
                        }
    
                        // Remove line clamps to show full text
                        clonedDoc.querySelectorAll('.truncate, .line-clamp-1, .line-clamp-2, .line-clamp-3, .overflow-hidden').forEach(el => {
                            (el as HTMLElement).style.whiteSpace = 'normal';
                            (el as HTMLElement).style.overflow = 'visible';
                            (el as HTMLElement).style.textOverflow = 'clip';
                            (el as HTMLElement).style.display = 'block';
                            (el as HTMLElement).style.webkitLineClamp = 'unset';
                            (el as HTMLElement).style.maxHeight = 'none';
                        });
                    }
                }
            });
    
            // Trigger download
            const link = document.createElement('a');
            link.download = `plan_menu_${activeWeekName.replace(/\s+/g, '_').toLowerCase()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Screenshot failed:", err);
            alert("Error capturing screenshot.");
        }
      }, [currentView, isDarkMode, activeWeekName, setCurrentView]);

      return { handleScreenshot };
};
