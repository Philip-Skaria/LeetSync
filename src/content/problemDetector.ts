// src/content/problemDetector.ts

interface ProblemDetails {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  problemNumber: number;
  tags: string[];
  description: string;
  url: string;
  timestamp: number;
}

class ProblemDetector {
  private currentProblem: ProblemDetails | null = null;

  /**
   * Extract problem details from the current LeetCode page
   */
  extractProblemDetails(): ProblemDetails | null {
    try {
      // Get problem title
      const titleElement = document.querySelector('[data-cy="question-title"]') || 
                          document.querySelector('h1') ||
                          document.querySelector('.css-v3d350');
      
      if (!titleElement) {
        console.log('LeetSync: Not on a problem page');
        return null;
      }

      const title = titleElement.textContent?.trim() || '';
      
      // Extract problem number from title or URL
      const problemNumber = this.extractProblemNumber(title, window.location.href);
      
      // Get difficulty
      const difficulty = this.extractDifficulty();
      
      // Get tags
      const tags = this.extractTags();
      
      // Get description (first paragraph of problem description)
      const description = this.extractDescription();
      
      const problemDetails: ProblemDetails = {
        title: title.replace(/^\d+\.\s*/, ''), // Remove number prefix
        difficulty,
        problemNumber,
        tags,
        description,
        url: window.location.href,
        timestamp: Date.now()
      };

      this.currentProblem = problemDetails;
      console.log('LeetSync: Problem detected:', problemDetails);
      
      return problemDetails;
      
    } catch (error) {
      console.error('LeetSync: Error extracting problem details:', error);
      return null;
    }
  }

  /**
   * Extract problem number from title or URL
   */
  private extractProblemNumber(title: string, url: string): number {
    // Try to extract from title first
    const titleMatch = title.match(/^(\d+)\./);
    if (titleMatch) {
      return parseInt(titleMatch[1]);
    }
    
    // Try to extract from URL
    const urlMatch = url.match(/problems\/.*?\/(\d+)/);
    if (urlMatch) {
      return parseInt(urlMatch[1]);
    }
    
    // Fallback: extract from URL path
    const pathMatch = url.match(/\/problems\/([^\/]+)/);
    if (pathMatch) {
      // This won't give us the number, but we can use string hash as fallback
      return this.hashCode(pathMatch[1]);
    }
    
    return 0;
  }

  /**
   * Extract difficulty level
   */
  private extractDifficulty(): 'Easy' | 'Medium' | 'Hard' {
    const difficultySelectors = [
      '[data-difficulty]',
      '.text-difficulty-easy',
      '.text-difficulty-medium', 
      '.text-difficulty-hard',
      '.text-green-s',
      '.text-yellow-s',
      '.text-red-s'
    ];

    for (const selector of difficultySelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.toLowerCase() || '';
        if (text.includes('easy')) return 'Easy';
        if (text.includes('medium')) return 'Medium';
        if (text.includes('hard')) return 'Hard';
      }
    }

    // Fallback: look for difficulty in any text
    const bodyText = document.body.textContent?.toLowerCase() || '';
    if (bodyText.includes('easy')) return 'Easy';
    if (bodyText.includes('medium')) return 'Medium';
    if (bodyText.includes('hard')) return 'Hard';

    return 'Medium'; // Default fallback
  }

  /**
   * Extract problem tags
   */
  private extractTags(): string[] {
    const tags: string[] = [];
    
    // Common tag selectors
    const tagSelectors = [
      '[data-cy="topic-tag"]',
      '.topic-tag',
      '.tag',
      'a[href*="/tag/"]'
    ];

    for (const selector of tagSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const tagText = el.textContent?.trim();
        if (tagText && !tags.includes(tagText)) {
          tags.push(tagText);
        }
      });
    }

    return tags;
  }

  /**
   * Extract problem description (first paragraph)
   */
  private extractDescription(): string {
    const descriptionSelectors = [
      '[data-cy="question-detail-main-tabs"]',
      '.question-content',
      '.content__u3I1',
      '.elfjS'
    ];

    for (const selector of descriptionSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const paragraphs = element.querySelectorAll('p');
        if (paragraphs.length > 0) {
          return paragraphs[0].textContent?.trim().substring(0, 200) + '...' || '';
        }
      }
    }

    return 'Problem description not found';
  }

  /**
   * Simple hash function for string to number conversion
   */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Check if we're currently on a problem page
   */
  isOnProblemPage(): boolean {
    return window.location.pathname.includes('/problems/') && 
           !window.location.pathname.includes('/problemset/');
  }

  /**
   * Get the current problem details
   */
  getCurrentProblem(): ProblemDetails | null {
    return this.currentProblem;
  }

  /**
   * Monitor for page changes and extract problem details
   */
  startMonitoring(): void {
    // Initial extraction
    if (this.isOnProblemPage()) {
      setTimeout(() => this.extractProblemDetails(), 1000);
    }

    // Monitor for navigation changes
    let lastUrl = window.location.href;
    
    const checkForChanges = () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        if (this.isOnProblemPage()) {
          setTimeout(() => this.extractProblemDetails(), 1000);
        }
      }
    };

    // Check every 2 seconds for URL changes
    setInterval(checkForChanges, 2000);
    
    // Also listen for popstate events
    window.addEventListener('popstate', () => {
      setTimeout(() => {
        if (this.isOnProblemPage()) {
          this.extractProblemDetails();
        }
      }, 500);
    });
  }
}

export default ProblemDetector;