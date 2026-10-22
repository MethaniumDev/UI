"use client";

import {
    useId,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ComponentProps,
    type ReactNode,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
    ChevronDown,
    Flag,
    Flower2,
    Hash,
    Lamp,
    Plane,
    Search,
    Hand,
    Smile,
    SmilePlus,
    Trophy,
    Utensils,
    X,
} from "lucide-react";

import { cn } from "../lib/utils";
import Emoji from "../markdown/emoji/emoji";
import { useEmojiRegistry } from "../markdown/emoji/context";
import type {
    EmojiDefinition,
    EmojiRegistry,
} from "../markdown/emoji/registry";
import { Button } from "./button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "./collapsible";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "./input-group";
import { ScrollArea } from "./scroll-area";
import { Separator } from "./separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const standardCategories = [
    { id: "standard-0", name: "Smileys & emotion", icon: <Smile />, group: 0 },
    { id: "standard-1", name: "People & body", icon: <Hand />, group: 1 },
    { id: "standard-3", name: "Animals & nature", icon: <Flower2 />, group: 3 },
    { id: "standard-4", name: "Food & drink", icon: <Utensils />, group: 4 },
    { id: "standard-5", name: "Travel & places", icon: <Plane />, group: 5 },
    { id: "standard-6", name: "Activities", icon: <Trophy />, group: 6 },
    { id: "standard-7", name: "Objects", icon: <Lamp />, group: 7 },
    { id: "standard-8", name: "Symbols", icon: <Hash />, group: 8 },
    { id: "standard-9", name: "Flags", icon: <Flag />, group: 9 },
];

export type EmojiPickerProps = Omit<ComponentProps<"div">, "onSelect"> & {
    registry?: EmojiRegistry;
    onEmojiSelect?: (emoji: EmojiDefinition) => void;
};

export function EmojiPicker({
    className,
    registry: registryOverride,
    onEmojiSelect,
    ...props
}: EmojiPickerProps) {
    const registry = useEmojiRegistry(registryOverride);
    const id = useId();
    const [scrollElement, setScrollElement] = useState<HTMLElement | null>(
        null,
    );
    const [columns, setColumns] = useState(9);
    const pendingCategory = useRef<string | null>(null);
    const pendingFocus = useRef<string | null>(null);
    const setScrollArea = useCallback((node: HTMLDivElement | null) => {
        setScrollElement(
            node?.querySelector<HTMLElement>(
                "[data-slot=scroll-area-viewport]",
            ) ?? null,
        );
    }, []);
    const [query, setQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("standard-0");
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
    const [preview, setPreview] = useState<EmojiDefinition>();

    const categories = useMemo(() => {
        const result: {
            id: string;
            name: string;
            icon: ReactNode;
            emojis: readonly EmojiDefinition[];
        }[] = standardCategories.map((category) => ({
            ...category,
            emojis: registry.emojis.filter(
                (emoji) =>
                    emoji.source === "twemoji" &&
                    (emoji.group === category.group ||
                        (category.group === 1 && emoji.group === 2)),
            ),
        }));
        result.push({
            id: "custom",
            name: "Custom emojis",
            icon: <SmilePlus />,
            emojis: registry.emojis.filter(
                (emoji) => emoji.source === "custom",
            ),
        });
        for (const category of registry.customCategories)
            result.push({
                ...category,
                id: `custom-${category.id}`,
                emojis: registry.emojis.filter(
                    (emoji) =>
                        emoji.source === "custom" &&
                        emoji.category === category.id,
                ),
            });
        return result.filter((category) => category.emojis.length > 0);
    }, [registry]);

    const matches = useMemo(
        () => new Set(registry.search(query)),
        [registry, query],
    );
    const visibleCategories = categories.map((category) => ({
        ...category,
        emojis: category.emojis.filter((emoji) => matches.has(emoji)),
    }));
    const hasResults = visibleCategories.some(
        (category) => category.emojis.length > 0,
    );

    useEffect(() => {
        if (!scrollElement) return;
        const observer = new ResizeObserver(() => {
            setColumns(
                Math.max(
                    1,
                    Math.floor((scrollElement.clientWidth - 16 + 2) / 38),
                ),
            );
        });
        observer.observe(scrollElement);
        return () => observer.disconnect();
    }, [scrollElement]);

    // Include headers in the virtualizer's offsets, but keep them mounted for collapsing.
    const rows: { key: string; size: number }[] = [];
    const layouts = visibleCategories
        .filter((category) => !query || category.emojis.length > 0)
        .map((category) => {
            const headerIndex = rows.length;
            rows.push({ key: category.id, size: 40 });
            const rowCount =
                query || !collapsed.has(category.id)
                    ? Math.ceil(category.emojis.length / columns)
                    : 0;
            const startIndex = rows.length;
            for (let row = 0; row < rowCount; row++)
                rows.push({
                    key: `${category.id}-${row}`,
                    size: row === rowCount - 1 ? 48 : 38,
                });
            return { category, headerIndex, startIndex, rowCount };
        });
    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => scrollElement,
        getItemKey: (index) => rows[index].key,
        estimateSize: (index) => rows[index].size,
        overscan: 3,
    });
    const virtualRows = virtualizer.getVirtualItems();

    useLayoutEffect(() => {
        if (pendingCategory.current) {
            const layout = layouts.find(
                ({ category }) => category.id === pendingCategory.current,
            );
            if (layout)
                virtualizer.scrollToIndex(layout.headerIndex, {
                    align: "start",
                });
            pendingCategory.current = null;
        }
        if (pendingFocus.current) {
            const button = Array.from(
                scrollElement?.querySelectorAll<HTMLButtonElement>(
                    "button[data-emoji]",
                ) ?? [],
            ).find((button) => button.dataset.emoji === pendingFocus.current);
            if (button) {
                button.focus({ preventScroll: true });
                pendingFocus.current = null;
            }
        }
    });

    function navigate(categoryId: string) {
        pendingCategory.current = categoryId;
        setQuery("");
        setActiveCategory(categoryId);
        setCollapsed(
            (previous) =>
                new Set([...previous].filter((value) => value !== categoryId)),
        );
    }

    return (
        <div
            data-slot="emoji-picker"
            aria-label="Emoji picker"
            className={cn(
                "flex h-[400px] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border bg-popover text-popover-foreground",
                className,
            )}
            {...props}
        >
            <div className="shrink-0 p-1.5 border-b">
                <InputGroup
                    variant="ghost"
                    className="ring-0! hover:bg-transparent! gap-1.5"
                >
                    <InputGroupAddon>
                        <Search aria-hidden="true" />
                    </InputGroupAddon>
                    <InputGroupInput
                        placeholder="Search emojis"
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            scrollElement?.scrollTo({ top: 0 });
                        }}
                    />
                    {query && (
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton
                                aria-label="Clear search"
                                size="icon-sm"
                                onClick={() => setQuery("")}
                            >
                                <X />
                            </InputGroupButton>
                        </InputGroupAddon>
                    )}
                </InputGroup>
            </div>
            <div className="flex min-h-0 flex-1">
                <div className="w-12 shrink-0 border-r overflow-auto scrollbar-none">
                    <nav
                        aria-label="Emoji categories"
                        className="flex flex-col items-center gap-1 py-1.5"
                    >
                        {categories.map((category, index) => (
                            <div key={category.id}>
                                {index === standardCategories.length && (
                                    <Separator className="my-2" />
                                )}
                                <Tooltip>
                                    <TooltipTrigger
                                        render={
                                            <Button
                                                variant={
                                                    activeCategory ===
                                                    category.id
                                                        ? "outline"
                                                        : "ghost"
                                                }
                                                aria-label={category.name}
                                                aria-current={
                                                    activeCategory ===
                                                    category.id
                                                        ? "true"
                                                        : undefined
                                                }
                                                aria-controls={`${id}-${category.id}`}
                                                onClick={() =>
                                                    navigate(category.id)
                                                }
                                                className={cn(
                                                    activeCategory !==
                                                        category.id &&
                                                        "hover:bg-transparent!",
                                                    "h-9 *:scale-110",
                                                )}
                                            >
                                                {category.icon}
                                            </Button>
                                        }
                                    />
                                    <TooltipContent side="right">
                                        {category.name}
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        ))}
                    </nav>
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                    <ScrollArea className="min-h-0 flex-1" ref={setScrollArea}>
                        <div className="px-2">
                            {!hasResults && (
                                <p
                                    role="status"
                                    className="px-3 py-5 text-center text-sm text-muted-foreground"
                                >
                                    No emojis found. Try another search.
                                </p>
                            )}
                            {layouts.map(
                                ({ category, startIndex, rowCount }) => {
                                    return (
                                        <Collapsible
                                            key={category.id}
                                            id={`${id}-${category.id}`}
                                            className="flow-root"
                                            open={
                                                !!query ||
                                                !collapsed.has(category.id)
                                            }
                                            onOpenChange={(open) =>
                                                setCollapsed((previous) => {
                                                    const next = new Set(
                                                        previous,
                                                    );
                                                    if (open)
                                                        next.delete(
                                                            category.id,
                                                        );
                                                    else next.add(category.id);
                                                    return next;
                                                })
                                            }
                                        >
                                            <CollapsibleTrigger
                                                render={
                                                    <Button
                                                        variant="ghost"
                                                        className="hover:bg-transparent! aria-expanded:bg-transparent! group my-1 flex w-full justify-start gap-2 px-1! text-xs text-muted-foreground"
                                                    />
                                                }
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className="shrink-0 [&_svg]:size-4 [&_img]:size-4"
                                                >
                                                    {category.icon}
                                                </span>
                                                <span className="truncate">
                                                    {category.name}
                                                </span>
                                                <Separator className="min-w-2 flex-1" />
                                                <ChevronDown className="size-3.5 transition-transform group-aria-expanded:rotate-180" />
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                {category.emojis.length ? (
                                                    <div
                                                        className="relative"
                                                        style={{
                                                            height:
                                                                rowCount * 38 +
                                                                10,
                                                        }}
                                                        onKeyDown={(event) => {
                                                            const offsets: Record<
                                                                string,
                                                                number
                                                            > = {
                                                                ArrowLeft: -1,
                                                                ArrowRight: 1,
                                                            };
                                                            const offset =
                                                                event.key ===
                                                                "ArrowDown"
                                                                    ? columns
                                                                    : event.key ===
                                                                        "ArrowUp"
                                                                      ? -columns
                                                                      : offsets[
                                                                            event
                                                                                .key
                                                                        ];
                                                            if (
                                                                offset ===
                                                                undefined
                                                            )
                                                                return;
                                                            const shortcode = (
                                                                event.target as HTMLElement
                                                            ).closest<HTMLButtonElement>(
                                                                "button[data-emoji]",
                                                            )?.dataset.emoji;
                                                            const index =
                                                                category.emojis.findIndex(
                                                                    (emoji) =>
                                                                        emoji.shortcode ===
                                                                        shortcode,
                                                                );
                                                            if (index < 0)
                                                                return;
                                                            event.preventDefault();
                                                            const nextIndex =
                                                                Math.max(
                                                                    0,
                                                                    Math.min(
                                                                        category
                                                                            .emojis
                                                                            .length -
                                                                            1,
                                                                        index +
                                                                            offset,
                                                                    ),
                                                                );
                                                            pendingFocus.current =
                                                                category.emojis[
                                                                    nextIndex
                                                                ].shortcode;
                                                            virtualizer.scrollToIndex(
                                                                startIndex +
                                                                    Math.floor(
                                                                        nextIndex /
                                                                            columns,
                                                                    ),
                                                                {
                                                                    align: "auto",
                                                                },
                                                            );
                                                            const button =
                                                                Array.from(
                                                                    event.currentTarget.querySelectorAll<HTMLButtonElement>(
                                                                        "button[data-emoji]",
                                                                    ),
                                                                ).find(
                                                                    (button) =>
                                                                        button
                                                                            .dataset
                                                                            .emoji ===
                                                                        pendingFocus.current,
                                                                );
                                                            if (button) {
                                                                button.focus();
                                                                pendingFocus.current =
                                                                    null;
                                                            }
                                                        }}
                                                    >
                                                        {virtualRows
                                                            .filter(
                                                                (row) =>
                                                                    row.index >=
                                                                        startIndex &&
                                                                    row.index <
                                                                        startIndex +
                                                                            rowCount,
                                                            )
                                                            .map((row) => (
                                                                <div
                                                                    key={
                                                                        row.key
                                                                    }
                                                                    className="absolute inset-x-0 grid gap-0.5"
                                                                    style={{
                                                                        top:
                                                                            (row.index -
                                                                                startIndex) *
                                                                            38,
                                                                        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                                                                    }}
                                                                >
                                                                    {category.emojis
                                                                        .slice(
                                                                            (row.index -
                                                                                startIndex) *
                                                                                columns,
                                                                            (row.index -
                                                                                startIndex +
                                                                                1) *
                                                                                columns,
                                                                        )
                                                                        .map(
                                                                            (
                                                                                emoji,
                                                                            ) => (
                                                                                <Button
                                                                                    key={
                                                                                        emoji.shortcode
                                                                                    }
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="icon-lg"
                                                                                    className="size-9 w-full hover:bg-transparent!"
                                                                                    aria-label={
                                                                                        emoji.shortcode
                                                                                    }
                                                                                    data-emoji={
                                                                                        emoji.shortcode
                                                                                    }
                                                                                    onMouseEnter={() =>
                                                                                        setPreview(
                                                                                            emoji,
                                                                                        )
                                                                                    }
                                                                                    onFocus={() =>
                                                                                        setPreview(
                                                                                            emoji,
                                                                                        )
                                                                                    }
                                                                                    onClick={() => {
                                                                                        setPreview(
                                                                                            emoji,
                                                                                        );
                                                                                        onEmojiSelect?.(
                                                                                            emoji,
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    <Emoji
                                                                                        shortcode={
                                                                                            emoji.shortcode
                                                                                        }
                                                                                        registry={
                                                                                            registry
                                                                                        }
                                                                                        tooltip={
                                                                                            false
                                                                                        }
                                                                                        className="size-6"
                                                                                    />
                                                                                </Button>
                                                                            ),
                                                                        )}
                                                                </div>
                                                            ))}
                                                    </div>
                                                ) : (
                                                    <p className="px-2 py-4 text-xs text-muted-foreground">
                                                        No custom emojis added
                                                        yet.
                                                    </p>
                                                )}
                                            </CollapsibleContent>
                                        </Collapsible>
                                    );
                                },
                            )}
                        </div>
                    </ScrollArea>
                    <div className="flex h-16 shrink-0 items-center gap-3 border-t px-4">
                        {preview &&
                        registry.resolve(preview.shortcode) === preview ? (
                            <>
                                <Emoji
                                    registry={registry}
                                    shortcode={preview.shortcode}
                                    tooltip={false}
                                    className="size-8 shrink-0"
                                />
                                <span className="truncate text-sm">
                                    {preview.shortcode}
                                </span>
                            </>
                        ) : (
                            <>
                                <Smile className="size-7 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    Choose an emoji
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
