"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { usePromptInputAttachments } from "@/features/suite/components/ui/ai-elements/prompt-input";
import type {
  SuiteImageSelectionBounds,
  SuitePromptAttachment,
} from "@/features/suite/components/ui/ai-elements/prompt-input";
import { useGetProjectImages } from "@/features/suite/hooks/api/use-image";
import { useSuiteTracking } from "@/features/suite/hooks/use-suite-tracking";
import {
  useSuiteConversation,
  useSuiteConversationStore,
} from "@/features/suite/stores/conversation/hooks";
import { isSuiteNotFoundError } from "@/features/suite/utils/api-error";
import { SUITE_TEMPLATE_GENERATION_ID_PREFIX } from "@/features/suite/utils/constants/conversation";

import { useSidebar } from "../ui/sidebar";
import { SCALE_STEP } from "./constants";
import { StudioBottomBar } from "./studio-bottom-bar";
import { StudioCanvas } from "./studio-canvas";
import { StudioCardPopup } from "./studio-card-popup";
import type { StudioCard } from "./types";
import { downloadCardImages, extractMaskedCrop, useStudio } from "./use-studio";

const SUITE_SIDEBAR_WIDTH = 416;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const getImageSelectionBounds = (
  card: StudioCard,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): SuiteImageSelectionBounds | undefined => {
  if (!card.img || !card.imgRect) {
    return undefined;
  }

  const { ix, iy, iw, ih } = card.imgRect;
  const left = Math.max(rx, ix);
  const top = Math.max(ry, iy);
  const right = Math.min(rx + rw, ix + iw);
  const bottom = Math.min(ry + rh, iy + ih);

  if (right <= left || bottom <= top) {
    return undefined;
  }

  const imageWidth = card.img.naturalWidth;
  const imageHeight = card.img.naturalHeight;
  const scaleX = imageWidth / iw;
  const scaleY = imageHeight / ih;
  const imageLeft = clamp(Math.floor((left - ix) * scaleX), 0, imageWidth);
  const imageTop = clamp(Math.floor((top - iy) * scaleY), 0, imageHeight);
  const imageRight = clamp(
    Math.ceil((right - ix) * scaleX),
    imageLeft,
    imageWidth
  );
  const imageBottom = clamp(
    Math.ceil((bottom - iy) * scaleY),
    imageTop,
    imageHeight
  );

  return {
    height: imageBottom - imageTop,
    imageHeight,
    imageWidth,
    unit: "px",
    width: imageRight - imageLeft,
    x: imageLeft,
    y: imageTop,
  };
};

export function StudioPage({
  projectId,
  isNewProject,
  onProjectNotFound,
}: {
  projectId?: string;
  isNewProject?: boolean;
  onProjectNotFound?: () => void;
}) {
  const sidebarOpenRef = useRef(true);
  const isMobileRef = useRef(false);

  const { open, setOpen, isMobile } = useSidebar();
  // oxlint-disable-next-line react/react-compiler -- ref write during render to keep latest-value ref in sync for use in stable callbacks (getSuiteSidebarOffset), standard latest-ref pattern
  isMobileRef.current = isMobile;

  const getSuiteSidebarOffset = useCallback(
    () =>
      !isMobileRef.current && sidebarOpenRef.current ? SUITE_SIDEBAR_WIDTH : 0,
    []
  );

  const {
    stageRef,
    cards,
    studioMode,
    zoom,
    spacePanning,
    isDrawingRef,
    tryActivateSpacePan,
    setMode,
    zoomAt,
    zoomBy,
    fitAll,
    fitFirstTemplateZoom,
    loadImages,
    addSkeletons,
    addAnnotation,
    removeAnnotation,
    canvasContainerRef,
    selectedCardIds,
    selectCards,
    popupPos,
    updatePopupPos,
    addFullImagePill,
    removeFullImagePill,
    trimOrphanSkeletons,
    failOrphanSkeletons,
    clearAllAnnotations,
    isFocusSuppressed,
  } = useStudio(getSuiteSidebarOffset);
  const promptAttachments = usePromptInputAttachments();
  const tracking = useSuiteTracking();
  // NOTE: items are intentionally NOT subscribed via a render selector — during streaming the bot
  // text reveal updates the store every ~20ms, and a render selector would re-render this whole
  // component (and the entire Konva canvas under it) on every tick. The items-driven canvas sync
  // below uses store.subscribe instead, which runs without re-rendering.
  const conversationStore = useSuiteConversationStore();
  const historyItemCount = useSuiteConversation((s) => s.historyItemCount);
  const pendingSkeletonHint = useSuiteConversation(
    (s) => s.pendingSkeletonHint
  );
  const clearPendingSkeletonHint = useSuiteConversation(
    (s) => s.clearPendingSkeletonHint
  );
  const settledNoOutputGenId = useSuiteConversation(
    (s) => s.settledNoOutputGenId
  );

  const prevOpenRef = useRef(true);
  const isInitialTemplateRef = useRef(false);
  const fitFirstTemplateZoomRef = useRef(fitFirstTemplateZoom);
  // oxlint-disable-next-line react/react-compiler -- ref write during render to keep latest-value ref in sync for use inside a ResizeObserver callback registered in an effect
  fitFirstTemplateZoomRef.current = fitFirstTemplateZoom;
  const fitAllRef = useRef(fitAll);
  // Route through fitFirstTemplateZoom for the initial template case so sidebar
  // ResizeObserver (which calls fitAllRef.current) doesn't override the 160% zoom.
  // oxlint-disable-next-line react/react-compiler -- ref write during render assigning a closure so the ResizeObserver callback (registered once in an effect) always calls the latest fit logic
  fitAllRef.current = (animate = false) =>
    isInitialTemplateRef.current
      ? fitFirstTemplateZoomRef.current(animate)
      : fitAll(animate);
  const cardsLengthRef = useRef(cards.length);
  // oxlint-disable-next-line react/react-compiler -- ref write during render to keep latest cards.length in sync for use inside a ResizeObserver callback registered in an effect
  cardsLengthRef.current = cards.length;
  const didInitialFitRef = useRef(false);
  const didSidebarReadyFitRef = useRef(false);

  useEffect(() => {
    if (didInitialFitRef.current || cards.length === 0) {
      return;
    }
    didInitialFitRef.current = true;
    const isInitialTemplate = cards[0]?.generationId?.startsWith(
      SUITE_TEMPLATE_GENERATION_ID_PREFIX
    );
    if (isInitialTemplate) {
      isInitialTemplateRef.current = true;
      fitFirstTemplateZoom(false);
    } else {
      fitAll(false);
    }
  }, [cards, cards.length, fitAll, fitFirstTemplateZoom]);

  useEffect(() => {
    sidebarOpenRef.current = open;
    if (prevOpenRef.current !== open) {
      fitAll();
    }
    prevOpenRef.current = open;
  }, [open, fitAll]);

  // Re-fit once the main app sidebar finishes animating (e.g. after background
  // tab load where CSS transitions are throttled and --main-sidebar-offset may
  // have been 0 at the time of the initial fit). Debounced so we only call
  // fitAll once, after the sidebar CSS transition settles, not on every frame.
  useEffect(() => {
    const sidebar = document.querySelector("#sidebar");
    if (!sidebar) {
      return;
    }
    let timer: ReturnType<typeof setTimeout> | null = null;
    const ro = new ResizeObserver(() => {
      if (cardsLengthRef.current === 0) {
        return;
      }
      if (timer !== null) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        fitAllRef.current(didSidebarReadyFitRef.current);
        didSidebarReadyFitRef.current = true;
        timer = null;
      }, 150);
    });
    ro.observe(sidebar);
    return () => {
      ro.disconnect();
      if (timer !== null) {
        clearTimeout(timer);
      }
    };
  }, []);

  // Sync generated images from conversation store → Studio canvas
  const loadImagesRef = useRef(loadImages);
  // oxlint-disable-next-line react/react-compiler -- ref write during render to keep latest loadImages in sync for use inside the history-sync effect below
  loadImagesRef.current = loadImages;

  // Only load history for projects that existed at mount time (not create-flow projects).
  const initialProjectIdRef = useRef(projectId);

  // Load historical images from API grouped by message
  const {
    data: projectImagesData,
    error: projectImagesError,
    hasNextPage,
    fetchNextPage,
    isFetching,
    // oxlint-disable-next-line react/react-compiler -- reading initialProjectIdRef.current during render is intentional: it freezes the mount-time projectId so the query stays keyed to the original project, not a value the compiler can track as render-stable
  } = useGetProjectImages({ projectId: initialProjectIdRef.current ?? "" });

  const fetchNextPageRef = useRef(fetchNextPage);
  // oxlint-disable-next-line react/react-compiler -- ref write during render to keep latest fetchNextPage in sync for use inside an effect
  fetchNextPageRef.current = fetchNextPage;

  // Project deleted/never existed → images return NOT_FOUND. Bail back to home.
  const onProjectNotFoundRef = useRef(onProjectNotFound);
  // oxlint-disable-next-line react/react-compiler -- ref write during render to keep latest onProjectNotFound callback in sync for use inside an effect
  onProjectNotFoundRef.current = onProjectNotFound;
  useEffect(() => {
    if (isSuiteNotFoundError(projectImagesError)) {
      onProjectNotFoundRef.current?.();
    }
  }, [projectImagesError]);

  useEffect(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPageRef.current();
    }
  }, [hasNextPage, isFetching]);

  // History images load ONCE — when entering an existing project or after a page
  // reload. They must NOT reload when the projectImages query is invalidated
  // mid-session (useStreamMessage.onSuccess on message.done invalidates it). If we
  // reloaded, a freshly generated image would appear on the canvas via this API
  // path the moment the stream finishes — bypassing the animation queue that is
  // meant to reveal it in sync with the conversation panel (e.g. after the design
  // guideline finishes animating). Lock off once the initial paginated load ends.
  const historyLoadedRef = useRef(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  useEffect(() => {
    if (historyLoadedRef.current) {
      return;
    }
    // Create-flow project: projectId is undefined at mount (the project is created AFTER the studio
    // mounts), so initialProjectIdRef froze empty and the project-images query is permanently
    // disabled (enabled: !!projectId) → projectImagesData never arrives. There is NO history to
    // paint here (every image this session is placed live via syncCanvasWithItems), so the
    // "wait for history before skeletons" guard has nothing to wait for. Mark loaded immediately so
    // pendingSkeletonHint renders the in-flight skeletons at analysis time instead of stalling until
    // the generating block runs. Existing-project / resume always mount WITH a route projectId, so
    // they skip this branch and keep the original ordering behaviour.
    if (!initialProjectIdRef.current) {
      historyLoadedRef.current = true;
      setHistoryLoaded(true);
      return;
    }
    if (!projectImagesData?.pages) {
      return;
    }
    // Load once, only after EVERY page is in — so templates can be placed before ALL generated
    // groups no matter which page each arrived on.
    if (hasNextPage) {
      return;
    }
    // Wait for the query to settle before locking. If we navigate back immediately after a stream,
    // React Query may serve stale cache (pre-last-image) while a background refetch is in flight.
    // Locking on stale data causes the last image to never appear. Once isFetching is false the
    // data is fresh; mid-session refetches are still blocked by historyLoadedRef above.
    if (isFetching) {
      return;
    }

    const groups = projectImagesData.pages.flatMap(
      (page) => page?.groups ?? []
    );

    // Templates first: each template is its own group (generationId = template.id), placed before
    // all generated groups. Dedup by id so a template shared across turns is only added once.
    const seenTemplateIds = new Set<string>();
    for (const group of groups) {
      const { template } = group;
      if (!template || seenTemplateIds.has(template.id)) {
        continue;
      }
      seenTemplateIds.add(template.id);
      loadImagesRef.current([template.downloadUrl], {
        generationId: template.id,
        imageIds: [template.id],
        noFocus: true,
      });
    }

    // Then the generated images, one group (row) per message.
    for (const group of groups) {
      if (group.images.length === 0) {
        continue;
      }
      loadImagesRef.current(
        group.images.map((img) => img.downloadUrl),
        {
          generationId: group.messageId,
          imageIds: group.images.map((img) => img.id),
          noFocus: true,
        }
      );
    }

    historyLoadedRef.current = true;
    // oxlint-disable-next-line react/react-compiler -- setState inside a data-loading effect to flip the one-time "history painted" flag; gated by historyLoadedRef so it only fires once and can't be removed without restructuring the ref-gated loading sequence
    setHistoryLoaded(true);
  }, [projectImagesData, hasNextPage, isFetching]);
  const addSkeletonsRef = useRef(addSkeletons);
  // oxlint-disable-next-line react/react-compiler -- ref write during render to keep latest addSkeletons in sync for use inside effects/callbacks below
  addSkeletonsRef.current = addSkeletons;
  const clearPendingSkeletonHintRef = useRef(clearPendingSkeletonHint);
  // oxlint-disable-next-line react/react-compiler -- ref write during render to keep latest clearPendingSkeletonHint in sync for use inside effects/callbacks below
  clearPendingSkeletonHintRef.current = clearPendingSkeletonHint;
  const trimOrphanSkeletonsRef = useRef(trimOrphanSkeletons);
  // oxlint-disable-next-line react/react-compiler -- ref write during render to keep latest trimOrphanSkeletons in sync for use inside effects/callbacks below
  trimOrphanSkeletonsRef.current = trimOrphanSkeletons;
  const failOrphanSkeletonsRef = useRef(failOrphanSkeletons);
  // oxlint-disable-next-line react/react-compiler -- ref write during render to keep latest failOrphanSkeletons in sync for use inside effects/callbacks below
  failOrphanSkeletonsRef.current = failOrphanSkeletons;
  const clearAllAnnotationsRef = useRef(clearAllAnnotations);
  // oxlint-disable-next-line react/react-compiler -- ref write during render to keep latest clearAllAnnotations in sync for use inside effects/callbacks below
  clearAllAnnotationsRef.current = clearAllAnnotations;
  const isFocusSuppressedRef = useRef(isFocusSuppressed);
  // oxlint-disable-next-line react/react-compiler -- ref write during render to keep latest isFocusSuppressed in sync for use inside effects/callbacks below
  isFocusSuppressedRef.current = isFocusSuppressed;
  const promptAttachmentsRef = useRef(promptAttachments);
  // oxlint-disable-next-line react/react-compiler -- ref write during render to keep latest promptAttachments in sync for use inside effects/callbacks below
  promptAttachmentsRef.current = promptAttachments;
  const historyItemCountRef = useRef(historyItemCount);
  // oxlint-disable-next-line react/react-compiler -- ref write during render to keep latest historyItemCount in sync for use inside effects/callbacks below
  historyItemCountRef.current = historyItemCount;
  const lastHandledGeneratingRef = useRef<string | null>(null);
  const trimmedGenerationIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!pendingSkeletonHint) {
      return;
    }
    // Wait until history images are painted before adding skeletons so that resume-stream
    // skeletons always append AFTER existing history cards, not before them.
    if (!historyLoaded) {
      return;
    }
    lastHandledGeneratingRef.current = pendingSkeletonHint.generationId;
    addSkeletonsRef.current(pendingSkeletonHint.count, {
      assetType: pendingSkeletonHint.assetType,
      generationId: pendingSkeletonHint.generationId,
    });
    clearPendingSkeletonHintRef.current();
  }, [pendingSkeletonHint, historyLoaded]);

  // Canvas ⟷ conversation sync. Subscribed OUTSIDE the render path (store.subscribe, coalesced
  // into a microtask) so per-tick item updates during streaming don't re-render the Konva tree.
  // Logic is idempotent (lastHandledGeneratingRef / trimmedGenerationIdsRef / URL dedup), so
  // coalescing multiple store writes into one pass is safe.
  const lastUserItemIdRef = useRef<string | null>(null);
  const didInitUserItemRef = useRef(false);
  useEffect(() => {
    let scheduled = false;
    let disposed = false;

    // Find the "live" generating item = a generating item with NO generated item after it,
    // and create new skeleton cards when we see a NEW live generating item (track by generationId).
    const handleLiveGeneratingItem = (
      conversationItems: ReturnType<typeof conversationStore.getState>["items"]
    ) => {
      let liveGeneratingIdx = -1;
      for (const [idx, item] of conversationItems.entries()) {
        if (item.type !== "generating") {
          continue;
        }
        const hasGeneratedAfter = conversationItems
          .slice(idx + 1)
          .some((i) => i.type === "generated");
        if (!hasGeneratedAfter) {
          liveGeneratingIdx = idx;
        }
      }
      const liveGeneratingItem =
        liveGeneratingIdx >= 0 ? conversationItems[liveGeneratingIdx] : null;

      if (
        liveGeneratingItem &&
        liveGeneratingItem.type === "generating" &&
        liveGeneratingItem.generationId !== lastHandledGeneratingRef.current
      ) {
        lastHandledGeneratingRef.current =
          liveGeneratingItem.generationId ?? null;
        addSkeletonsRef.current(liveGeneratingItem.imageCount, {
          assetType: liveGeneratingItem.assetType,
          generationId: liveGeneratingItem.generationId,
        });
      }
    };

    // Load images for generated items — but ONLY live ones created this session (index >=
    // historyItemCount). History generated items are painted by the project-images API
    // (useGetProjectImages). Letting both paint the same canvas double-feeds it with different
    // grouping/order (conversation groups per message, the API per group, deduped by URL → whichever
    // loads first wins → messy). On a plain reload (no stream) every item is history → none load here.
    const processGeneratedItems = (
      conversationItems: ReturnType<typeof conversationStore.getState>["items"]
    ) => {
      for (const [index, item] of conversationItems.entries()) {
        if (index < historyItemCountRef.current) {
          continue;
        }
        if (item.type === "generated" && item.images.length > 0) {
          const validEntries = item.images
            .map((src, i) => ({ imageId: item.imageIds?.[i], src }))
            .filter(
              (entry): entry is { imageId: string | undefined; src: string } =>
                entry.src !== null
            );
          loadImagesRef.current(
            validEntries.map((e) => e.src),
            {
              assetType: item.assetType,
              generationId: item.generationId,
              imageIds: validEntries
                .map((e) => e.imageId)
                .filter((id): id is string => id !== undefined),
            }
          );

          // All images delivered → trim orphan skeletons, re-fit.
          // Annotations are NOT cleared here: the user may have already drawn new annotations
          // for the next turn while this one was streaming. The "new user item" handler below
          // is the sole place that clears annotations (scoped to submit time, not completion time).
          const genId = item.generationId;
          if (
            genId &&
            item.images.every((src) => src !== null) &&
            !trimmedGenerationIdsRef.current.has(genId)
          ) {
            trimmedGenerationIdsRef.current.add(genId);
            trimOrphanSkeletonsRef.current(genId);
            if (isFocusSuppressedRef.current(genId)) {
              fitAllRef.current();
            }
          }
        }
      }
    };

    // Stream error → renderError removed the generated/generating items and appended an error
    // card. The canvas skeletons (Konva loading cards) are NOT in the store, so nothing else
    // touches them → flip them to the "Failed to load" state here (they'd otherwise stay stuck
    // loading forever). They linger until the NEXT generation, which clears them via addSkeletons.
    const handleStreamError = (
      conversationItems: ReturnType<typeof conversationStore.getState>["items"]
    ) => {
      const lastGenId = lastHandledGeneratingRef.current;
      if (lastGenId && !trimmedGenerationIdsRef.current.has(lastGenId)) {
        const hasGenerating = conversationItems.some(
          (item) =>
            item.type === "generating" && item.generationId === lastGenId
        );
        const hasGenerated = conversationItems.some(
          (item) => item.type === "generated" && item.generationId === lastGenId
        );
        // Scope to THIS generation's error card — a stale error from a prior failed turn (its card
        // lingers in the conversation) must not make the current turn look failed.
        const hasError = conversationItems.some(
          (item) => item.type === "error" && item.generationId === lastGenId
        );
        if (!hasGenerating && !hasGenerated && hasError) {
          trimmedGenerationIdsRef.current.add(lastGenId);
          failOrphanSkeletonsRef.current(lastGenId);
          // Annotations are NOT cleared on error: the user may have already drawn new annotations
          // for a retry while this turn was streaming. Clearing is handled solely by the
          // "new user item" handler below (fires on submit, not on completion/error).
        }
      }
    };

    // Clear canvas annotations the moment a message is sent. handleSubmit already snapshotted
    // the selections into the request before appending the user item, so wiping the rects/
    // attachments now is safe and doesn't wait for the turn to finish (delivered / error /
    // no-output). Detected via a NEW user item appearing; baseline is recorded on first run so
    // history loads and the home hand-off (first turn has no annotations anyway) don't clear.
    const handleNewUserItem = (
      conversationItems: ReturnType<typeof conversationStore.getState>["items"]
    ) => {
      const userItems = conversationItems.filter(
        (item) => item.type === "user"
      );
      const lastUserId = userItems.at(-1)?.id ?? null;
      if (!didInitUserItemRef.current) {
        didInitUserItemRef.current = true;
        lastUserItemIdRef.current = lastUserId;
        return;
      }
      if (!lastUserId || lastUserId === lastUserItemIdRef.current) {
        return;
      }
      lastUserItemIdRef.current = lastUserId;
      clearAllAnnotationsRef.current();
      const pa = promptAttachmentsRef.current;
      const annotationFiles = pa.files.filter(
        (f) => f.source === "canvas" && f.canvasMeta?.type === "annotation"
      );
      for (const f of annotationFiles) {
        pa.remove(f.id);
      }
    };

    const syncCanvasWithItems = () => {
      scheduled = false;
      if (disposed) {
        return;
      }
      const conversationItems = conversationStore.getState().items;
      handleLiveGeneratingItem(conversationItems);
      processGeneratedItems(conversationItems);
      handleStreamError(conversationItems);
      handleNewUserItem(conversationItems);
    };

    const schedule = () => {
      if (scheduled || disposed) {
        return;
      }
      scheduled = true;
      queueMicrotask(syncCanvasWithItems);
    };

    schedule(); // initial pass over whatever is already in the store
    const unsubscribe = conversationStore.subscribe((state, prevState) => {
      if (state.items !== prevState.items) {
        schedule();
      }
    });
    return () => {
      disposed = true;
      unsubscribe();
    };
  }, [conversationStore]);

  // Turn settled with no image output (count was promised via analysis.ready but BE delivered
  // none) → flip THIS turn's orphan skeletons to "Failed to load". Keyed by generationId
  // (each turn is independent), deduped via trimmedGenerationIdsRef so it runs once.
  // failOrphanSkeletons is a no-op when no skeletons were added (summary-only clarification, no
  // count). Annotations are NOT cleared here — user may have drawn them for the next turn already.
  useEffect(() => {
    const genId = settledNoOutputGenId;
    if (!genId || trimmedGenerationIdsRef.current.has(genId)) {
      return;
    }
    trimmedGenerationIdsRef.current.add(genId);
    failOrphanSkeletonsRef.current(genId);
  }, [settledNoOutputGenId]);

  // Prevent deselect when the click originated inside the card/popup.
  const suppressCloseRef = useRef(false);

  const handleCardClick = useCallback(
    (cardId: string) => {
      suppressCloseRef.current = true;
      selectCards([cardId]);
    },
    [selectCards]
  );

  const handleSelectCards = useCallback(
    (ids: string[]) => {
      if (ids.length > 0) {
        suppressCloseRef.current = true;
      }
      selectCards(ids);
    },
    [selectCards]
  );

  const handleStageEmptyClick = useCallback(() => {
    selectCards([]);
  }, [selectCards]);

  const handleStageDragMove = useCallback(() => {
    updatePopupPos();
  }, [updatePopupPos]);

  // Close popup on outside click (document-level, native)
  useEffect(() => {
    const handler = () => {
      if (suppressCloseRef.current) {
        suppressCloseRef.current = false;
        return;
      }
      selectCards([]);
    };
    document.addEventListener("click", handler);
    return () => {
      document.removeEventListener("click", handler);
    };
  }, [selectCards]);

  // Re-position popup on window resize
  useEffect(() => {
    const handler = () => updatePopupPos();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [updatePopupPos]);

  const isAddedToChat =
    selectedCardIds.length > 1 ||
    promptAttachments.files.some(
      (f) => f.source === "canvas" && f.canvasMeta?.type === "full-image"
    );

  const handleAddToChat = useCallback(() => {
    if (selectedCardIds.length === 0) {
      return;
    }
    suppressCloseRef.current = true;
    setOpen(true);

    const newAttachments: SuitePromptAttachment[] = [];

    for (const id of selectedCardIds) {
      const card = cards.find((c) => c.id === id);
      if (!card?.img?.src) {
        continue;
      }
      newAttachments.push({
        canvasMeta: {
          cardId: id,
          targetImageId: card.imageId,
          type: "full-image",
        },
        filename: `image-${id}.png`,
        id: `image-${id}`,
        mediaType: "image/png",
        source: "canvas",
        type: "file",
        uploadStatus: "completed",
        url: card.img.src,
      });
    }

    if (newAttachments.length > 0) {
      // Goes through addReferences (not restoreFiles) so it shares the maxFiles quota with
      // uploads and fires the over-limit toast instead of silently overflowing past 3.
      const added = promptAttachments.addReferences?.(newAttachments) ?? false;
      if (added) {
        tracking.trackAddImageToChat();
        for (const a of newAttachments) {
          const meta = a.canvasMeta as { cardId: string; type: "full-image" };
          addFullImagePill(meta.cardId);
        }
      }
    }
  }, [
    selectedCardIds,
    addFullImagePill,
    cards,
    promptAttachments,
    setOpen,
    tracking,
  ]);

  const handleAddAnnotation = useCallback(
    async (cardId: string, rx: number, ry: number, rw: number, rh: number) => {
      // Track only the FIRST annotation of a session (0 -> 1). Drawing more while some exist doesn't
      // re-fire; clearing all then drawing again does (count is back to 0). Captured before the add.
      const wasFirstAnnotation =
        cards.reduce((count, c) => count + c.annotations.length, 0) === 0;
      const annotId = addAnnotation(cardId, rx, ry, rw, rh);
      if (!annotId) {
        return;
      }
      const card = cards.find((c) => c.id === cardId);
      if (!card) {
        return;
      }
      const bounds = getImageSelectionBounds(card, rx, ry, rw, rh);

      if (!bounds) {
        removeAnnotation(cardId, annotId);
        return;
      }
      // Upload the FULL-resolution masked crop (aspect preserved), not the 56×56 UI pill thumbnail.
      const cropDataUrl = extractMaskedCrop(card, rx, ry, rw, rh);
      if (!cropDataUrl) {
        removeAnnotation(cardId, annotId);
        return;
      }
      const res = await fetch(cropDataUrl);
      const blob = await res.blob();
      const added = promptAttachments.add(
        [
          new File([blob], `annot-${annotId}.png`, {
            type: blob.type || "image/png",
          }),
        ],
        "canvas",
        {
          annotationId: annotId,
          bounds,
          cardId,
          targetImageId: card.imageId,
          type: "annotation",
        }
      );
      if (added) {
        if (wasFirstAnnotation) {
          tracking.trackCanvasMarkToEdit();
        }
        setOpen(true);
      } else {
        // blocked by maxFiles — rollback the annotation rect so user can draw again
        removeAnnotation(cardId, annotId);
      }
    },
    [
      addAnnotation,
      removeAnnotation,
      cards,
      promptAttachments,
      setOpen,
      tracking,
    ]
  );

  useEffect(
    () =>
      promptAttachments.subscribeToRemove((attachment) => {
        if (attachment.source !== "canvas" || !attachment.canvasMeta) {
          return;
        }

        if (attachment.canvasMeta.type === "annotation") {
          removeAnnotation(
            attachment.canvasMeta.cardId,
            attachment.canvasMeta.annotationId
          );
          return;
        }

        removeFullImagePill(attachment.canvasMeta.cardId);
      }),
    [promptAttachments, removeAnnotation, removeFullImagePill]
  );

  const handleDeleteAnnotation = useCallback(
    (cardId: string, annotationId: string) => {
      removeAnnotation(cardId, annotationId);
      const found = promptAttachments.files.find(
        (f) => f.filename === `annot-${annotationId}.png`
      );
      if (found) {
        promptAttachments.remove(found.id);
      }
    },
    [removeAnnotation, promptAttachments]
  );

  const handleDownload = useCallback(
    (format: "png" | "jpg" | "svg") => {
      const selectedCards = cards.filter((c) => selectedCardIds.includes(c.id));
      void downloadCardImages(selectedCards, format);
    },
    [selectedCardIds, cards]
  );

  return (
    <div className="relative flex size-full min-h-0 flex-col overflow-hidden">
      <StudioCanvas
        stageRef={stageRef}
        containerRef={canvasContainerRef}
        cards={cards}
        isNewProject={isNewProject}
        // oxlint-disable-next-line react/react-compiler -- getSuiteSidebarOffset() reads isMobileRef/sidebarOpenRef.current during render by design, to reflect the latest sidebar state without re-rendering on every sidebar change
        sidebarOffset={getSuiteSidebarOffset()}
        mode={studioMode}
        spacePanning={spacePanning}
        isDrawingRef={isDrawingRef}
        onDrawInteractionEnd={tryActivateSpacePan}
        zoomAt={zoomAt}
        onAddAnnotation={handleAddAnnotation}
        onDeleteAnnotation={handleDeleteAnnotation}
        selectedCardIds={selectedCardIds}
        onSelectCards={handleSelectCards}
        onCardClick={handleCardClick}
        onStageEmptyClick={handleStageEmptyClick}
        onStageDragMove={handleStageDragMove}
      />

      {popupPos && selectedCardIds.length > 0 && (
        <StudioCardPopup
          pos={popupPos}
          isAddedToChat={isAddedToChat}
          onInteract={() => {
            suppressCloseRef.current = true;
          }}
          onAddToChat={handleAddToChat}
          onDownload={handleDownload}
        />
      )}

      <StudioBottomBar
        zoom={zoom}
        mode={studioMode}
        spacePanning={spacePanning}
        onSetMode={setMode}
        onFit={fitAll}
        onZoomIn={() => zoomBy(SCALE_STEP, undefined, undefined, true)}
        onZoomOut={() => zoomBy(-SCALE_STEP, undefined, undefined, true)}
      />
    </div>
  );
}
