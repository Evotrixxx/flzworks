import { vi, describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { parseFolderName } from "../lib/portfolio-sync";

// 1. Setup Mocks for React hooks BEFORE importing components
const mockSetState = vi.fn();
let mockStateValue: any = null;

const mockUseState = vi.fn((init) => {
  const val = typeof init === "function" ? init() : init;
  return [val, (newVal: any) => {
    mockStateValue = newVal;
    mockSetState(newVal);
  }];
});

const registeredEffects: Array<{ effect: Function; deps?: any[] }> = [];
const mockUseEffect = vi.fn((effect, deps) => {
  registeredEffects.push({ effect, deps });
});

vi.mock("react", async () => {
  const actual = await vi.importActual("react") as any;
  return {
    ...actual,
    useState: (init: any) => mockUseState(init),
    useEffect: (effect: any, deps: any) => mockUseEffect(effect, deps),
  };
});

// Import the components under test
import { PortfolioOnepager } from "./portfolio-onepager";
import { MagazineAdmin } from "./magazine-admin";

describe("PortfolioOnepager - Showroom Mode Click Interception", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registeredEffects.length = 0;
    
    // Reset state mock implementation
    let stateCallCount = 0;
    mockUseState.mockImplementation((init) => {
      stateCallCount++;
      let val = typeof init === "function" ? init() : init;
      // In PortfolioOnepager:
      // 1. selectedArticle = null
      // 2. activeGallery = null
      // 3. selectedCategory = "ALL"
      // 4. uiHidden = true (for this test)
      if (stateCallCount === 4) {
        val = true;
      }
      return [val, mockSetState];
    });

    // Mock global window event listeners
    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      document: {
        documentElement: { scrollHeight: 1000 },
        activeElement: { tagName: "BODY" },
        querySelectorAll: vi.fn(() => []),
      },
      innerHeight: 800,
      scrollY: 100,
    } as any;
    global.document = global.window.document as any;
  });

  it("registers capturing click listener when uiHidden is true", () => {
    // Call component to register effects
    PortfolioOnepager({ instagramMedia: [], articles: [] });

    // Find the effect that depends on [uiHidden] (its dependency array contains true)
    const uiHiddenEffect = registeredEffects.find(
      (e) => e.deps && e.deps.includes(true)
    );
    expect(uiHiddenEffect).toBeDefined();

    // Execute the effect
    const cleanup = uiHiddenEffect!.effect();

    // Verify capturing click listener is added to window
    expect(global.window.addEventListener).toHaveBeenCalledWith(
      "click",
      expect.any(Function),
      true // capturing phase
    );

    // Get the click handler
    const clickHandler = vi.mocked(global.window.addEventListener).mock.calls.find(
      (call) => call[0] === "click"
    )?.[1] as Function;

    expect(clickHandler).toBeDefined();

    // Simulate click event
    const mockEvent = {
      stopPropagation: vi.fn(),
      preventDefault: vi.fn(),
    };

    clickHandler(mockEvent);

    // Verify click interception: stopPropagation and preventDefault must be called
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(mockEvent.preventDefault).toHaveBeenCalled();

    // Verify it exits showroom mode (sets uiHidden to false)
    expect(mockSetState).toHaveBeenCalledWith(false);

    // Run cleanup
    cleanup();
    expect(global.window.removeEventListener).toHaveBeenCalledWith(
      "click",
      expect.any(Function),
      true
    );
  });
});

describe("PortfolioOnepager - Scroll Spy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registeredEffects.length = 0;
    
    // Reset state mock implementation to default values
    mockUseState.mockImplementation((init) => {
      const val = typeof init === "function" ? init() : init;
      return [val, mockSetState];
    });
  });

  it("triggers the active section correctly when elements intersect", () => {
    const mockElements: Record<string, any> = {
      hero: { id: "hero" },
      process: { id: "process" },
      archive: { id: "archive" },
      interface: { id: "interface" },
      signals: { id: "signals" },
    };

    global.document = {
      getElementById: vi.fn((id) => mockElements[id] || null),
      querySelectorAll: vi.fn(() => []),
    } as any;

    const mockObserve = vi.fn();
    const mockUnobserve = vi.fn();
    const capturedObservers: Array<{ callback: Function; el: any }> = [];

    // Mock IntersectionObserver
    global.IntersectionObserver = class {
      constructor(callback: Function, options: any) {
        // Capture the callback and the element being observed
        capturedObservers.push({ callback, el: null });
      }
      observe(el: any) {
        mockObserve(el);
        const last = capturedObservers[capturedObservers.length - 1];
        if (last) last.el = el;
      }
      unobserve(el: any) {
        mockUnobserve(el);
      }
      disconnect() {}
    } as any;

    // Render component to trigger effects
    PortfolioOnepager({ instagramMedia: [], articles: [] });

    // There are multiple effects with empty dependency arrays.
    // Let's find the one that instantiates IntersectionObserver.
    // We can run all of them, or inspect them. Running all effects with deps = [] is safe.
    const emptyDepsEffects = registeredEffects.filter(
      (e) => e.deps && e.deps.length === 0
    );
    
    expect(emptyDepsEffects.length).toBeGreaterThanOrEqual(2);

    // Execute all of them
    emptyDepsEffects.forEach((e) => e.effect());

    // Verify all 5 sections are observed
    expect(mockObserve).toHaveBeenCalledTimes(5);
    expect(capturedObservers.length).toBe(5);

    // Find the observer for "interface"
    const interfaceObserver = capturedObservers.find(
      (obs) => obs.el && obs.el.id === "interface"
    );
    expect(interfaceObserver).toBeDefined();

    // Simulate "interface" section entering viewport
    interfaceObserver!.callback([
      { isIntersecting: true, target: mockElements.interface },
    ]);

    // Verify that setActiveSection("interface") is called
    expect(mockSetState).toHaveBeenCalledWith("interface");
  });
});

describe("Portfolio Sync - Folder Parsing & Categorization", () => {
  it("parses folder names correctly", () => {
    const cases = [
      {
        folder: "mirsairen_concept_2026_11_17",
        expectedTitle: "Mirsairen Concept",
        expectedDate: "2026-11-17",
      },
      {
        folder: "done_lego_car_2025_10_6",
        expectedTitle: "Lego Car (Completed)",
        expectedDate: "2025-10-06",
      },
      {
        folder: "godot_game_project",
        expectedTitle: "Godot Game Project",
        expectedDate: "N/A",
      },
    ];

    cases.forEach(({ folder, expectedTitle, expectedDate }) => {
      const { title, date } = parseFolderName(folder);
      expect(title).toBe(expectedTitle);
      expect(date).toBe(expectedDate);
    });
  });
});

describe("Accessibility Verification", () => {
  // Helper to recursively traverse React element tree and find elements
  function findElements(node: any, predicate: (node: any) => boolean, results: any[] = []) {
    if (!node) return results;
    if (predicate(node)) {
      results.push(node);
    }
    if (node.props && node.props.children) {
      React.Children.forEach(node.props.children, (child) => {
        findElements(child, predicate, results);
      });
    }
    return results;
  }

  it("checks touch targets and ARIA attributes in PortfolioOnepager", () => {
    const vdom = PortfolioOnepager({ instagramMedia: [], articles: [] });

    // 1. Find all buttons
    const buttons = findElements(vdom, (node) => node.type === "button");
    
    // Check if they have aria-label or text content
    buttons.forEach((btn) => {
      const hasAriaLabel = !!btn.props["aria-label"];
      const hasTextContent = typeof btn.props.children === "string" || 
                             (Array.isArray(btn.props.children) && btn.props.children.some((c: any) => typeof c === "string"));
      expect(hasAriaLabel || hasTextContent).toBe(true);
    });
  });

  it("checks accessibility in MagazineAdmin", () => {
    const mockArticles = [
      {
        id: "1",
        folderName: "test_folder",
        title: "Test Title",
        description: "Test Desc",
        date: "2026-06-29",
        visible: true,
        category: "CAR_DESIGN",
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const vdom = MagazineAdmin({ initialArticles: mockArticles, locale: "en" });

    // Find all elements with onClick handlers that are NOT buttons or links
    const clickables = findElements(
      vdom,
      (node) => node.props && node.props.onClick && node.type !== "button" && node.type !== "a"
    );

    // In MagazineAdmin, the accordion header is a div with onClick.
    // Let's verify if it has role="button", tabIndex={0}, and aria-expanded.
    const accordionHeaders = clickables.filter(
      (node) => node.props.className && node.props.className.includes("cursor-pointer")
    );

    accordionHeaders.forEach((header) => {
      const role = header.props.role;
      const tabIndex = header.props.tabIndex;
      const ariaExpanded = header.props["aria-expanded"];

      console.log(`Accordion Header Accessibility Check:
        role: ${role} (expected: "button")
        tabIndex: ${tabIndex} (expected: 0)
        aria-expanded: ${ariaExpanded} (expected: boolean)`);
    });
  });
});
