import {
	CmdKey,
	Editor,
	defaultValueCtx,
	editorViewCtx,
	editorViewOptionsCtx,
	rootCtx,
} from "@milkdown/core";
import { Ctx } from "@milkdown/ctx";
import { clipboard } from "@milkdown/plugin-clipboard";
import { cursor } from "@milkdown/plugin-cursor";
import { emoji } from "@milkdown/plugin-emoji";
import {
	history,
	historyKeymap,
	redoCommand,
	undoCommand,
} from "@milkdown/plugin-history";
import { indent } from "@milkdown/plugin-indent";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { TooltipProvider, tooltipFactory } from "@milkdown/plugin-tooltip";
import { Uploader, upload, uploadConfig } from "@milkdown/plugin-upload";
import {
	commonmark,
	linkSchema,
	toggleEmphasisCommand,
	toggleStrongCommand,
	wrapInBlockquoteCommand,
	wrapInBulletListCommand,
	wrapInHeadingCommand,
	wrapInOrderedListCommand,
} from "@milkdown/preset-commonmark";
import { Node, Schema } from "@milkdown/prose/model";
import { EditorState } from "@milkdown/prose/state";
import { EditorView } from "@milkdown/prose/view";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { nord } from "@milkdown/theme-nord";
import { callCommand, replaceAll } from "@milkdown/utils";
import { FontBoldIcon, FontItalicIcon, QuoteIcon } from "@radix-ui/react-icons";
import { forwardRef, useImperativeHandle } from "react";
import { BiListOl, BiListUl } from "react-icons/bi";
import { GrRedo, GrUndo } from "react-icons/gr";
import { LuHeading1, LuHeading2, LuHeading3 } from "react-icons/lu";
import { cn } from "utils";
import env from "../../lib/env";
import { Button } from "../ui/button";
import { placeholderCtx, placeholder as placeholderPlugin } from "./plugins";

const linkTooltip = tooltipFactory("editor-tooltip");

interface MilkdownEditorProps {
	onChange?: (value: string) => void;
	placeholder?: string;
	defaultValue?: string;
}

const uploader: Uploader = async (files: FileList, schema: Schema) => {
	const images: File[] = [];
	for (let i = 0; i < files.length; i++) {
		const file = files.item(i);
		if (!file) continue;
		if (!file.type.includes("image")) continue;
		images.push(file);
	}

	const nodes: Node[] = await Promise.all(
		images.map(async (image) => {
			const formData = new FormData();
			formData.append("files", image);
			const res = await fetch(`${env.NEXT_PUBLIC_SERVER_BASE_URL}/media`, {
				method: "POST",
				body: formData,
			});
			const json = await res.json();
			const src = json[0];
			const alt = image.name;
			return schema.nodes.image.createAndFill({
				src,
				alt,
			}) as Node;
		}),
	);

	return nodes;
};

function tooltipPluginView(ctx: Ctx) {
	return (_view: EditorView) => {
		const content = document.createElement("div");
		const provider = new TooltipProvider({
			content,
			shouldShow: (view: EditorView) => {
				const { selection, doc } = view.state;
				const has = doc.rangeHasMark(
					selection.from,
					selection.to,
					linkSchema.type(ctx),
				);
				if (has || selection.empty) return false;

				return true;
			},
		});

		content.textContent = "🔗";
		content.className = "link-insert-button";
		content.onmousedown = (e: MouseEvent) => {
			e.preventDefault();
			const view = ctx.get(editorViewCtx);
			const { selection } = view.state;
			ctx.get(linkTooltip.key).addLink(selection.from, selection.to);
			provider.hide();
		};

		return {
			update: (updatedView: EditorView, prevState: EditorState) => {
				if (ctx.get(linkTooltipState.key).mode === "edit") return;
				provider.update(updatedView, prevState);
			},
			destroy: () => {
				provider.destroy();
				content.remove();
			},
		};
	};
}

const BaseMilkdownEditor = forwardRef(
	({ onChange, placeholder, defaultValue }: MilkdownEditorProps, ref) => {
		const { get } = useEditor(
			(root) =>
				Editor.make()
					.config((ctx) => {
						if (defaultValue) {
							ctx.set(defaultValueCtx, defaultValue);
						}

						const listener = ctx.get(listenerCtx);
						listener.markdownUpdated((ctx, markdown, prevMarkdown) => {
							if (markdown !== prevMarkdown) {
								if (onChange) {
									onChange(markdown);
								}
							}
						});

						ctx.set(historyKeymap.key, {
							Undo: "Mod-z",
							Redo: ["Mod-y", "Shift-Mod-z"],
						});

						ctx.update(editorViewOptionsCtx, (prev) => ({
							...prev,
							attributes: {
								class:
									"border border-primary px-3 py-1 outline-none text-base min-h-[150px] bg-transparent text-base prose max-w-full",
							},
						}));
						ctx.set(rootCtx, root);

						ctx.set(historyKeymap.key, {
							Undo: "Mod-z",
							Redo: ["Mod-y", "Shift-Mod-z"],
						});

						ctx.update(uploadConfig.key, (prev) => ({
							...prev,
							uploader,
						}));

						ctx.set(placeholderCtx, placeholder ? placeholder : "");

						ctx.set(linkTooltip.key, {
							view: tooltipPluginView(ctx),
						});
					})
					.config(nord)
					.use(clipboard)
					.use(placeholderPlugin)
					.use(history)
					.use(emoji)
					.use(listener)
					.use(commonmark)
					.use(indent)
					.use(upload)
					.use(cursor)
					.use(linkTooltip),
			[],
		);

		function call<T>(command: CmdKey<T>, payload?: T) {
			return get()?.action(callCommand(command, payload));
		}
		function setContent(markdown: string) {
			return get()?.action(replaceAll(markdown));
		}
		useImperativeHandle(ref, () => ({
			setContent,
		}));
		return (
			<div className={cn("h-full", "flex", "flex-col")}>
				<div
					className={cn(
						"border",
						"p-3",
						"bg-[#D1E9FA]",
						"flex",
						"items-center",
						"gap-2",
						"border-b-0",
					)}
				>
					<Button
						size="icon"
						variant="blackOutline"
						onClick={() => call(wrapInHeadingCommand.key, 1)}
					>
						<LuHeading1 />
					</Button>
					<Button
						size="icon"
						variant="blackOutline"
						onClick={() => call(wrapInHeadingCommand.key, 2)}
					>
						<LuHeading2 />
					</Button>
					<Button
						size="icon"
						variant="blackOutline"
						onClick={() => call(wrapInHeadingCommand.key, 3)}
					>
						<LuHeading3 />
					</Button>
					<Button
						size="icon"
						variant="blackOutline"
						onClick={() => call(undoCommand.key)}
					>
						<GrUndo />
					</Button>
					<Button
						size="icon"
						variant="blackOutline"
						onClick={() => call(redoCommand.key)}
					>
						<GrRedo />
					</Button>
					<Button
						size="icon"
						variant="blackOutline"
						onClick={() => call(toggleStrongCommand.key)}
					>
						<FontBoldIcon />
					</Button>
					<Button
						size="icon"
						variant="blackOutline"
						onClick={() => call(toggleEmphasisCommand.key)}
					>
						<FontItalicIcon />
					</Button>
					<Button
						size="icon"
						variant="blackOutline"
						onClick={() => call(wrapInBulletListCommand.key)}
					>
						<BiListUl />
					</Button>
					<Button
						size="icon"
						variant="blackOutline"
						onClick={() => call(wrapInOrderedListCommand.key)}
					>
						<BiListOl />
					</Button>
					<Button
						size="icon"
						variant="blackOutline"
						onClick={() => call(wrapInBlockquoteCommand.key)}
					>
						<QuoteIcon />
					</Button>
				</div>
				<Milkdown />
			</div>
		);
	},
);

const MilkdownEditor = forwardRef((props: MilkdownEditorProps, ref) => {
	return (
		<MilkdownProvider>
			<BaseMilkdownEditor ref={ref} {...props} />
		</MilkdownProvider>
	);
});

export default MilkdownEditor;
