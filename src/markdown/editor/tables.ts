import { StateField, Transaction, type EditorState } from "@codemirror/state";
import {
  Decoration,
  EditorView,
  WidgetType,
  type DecorationSet,
} from "@codemirror/view";

import { codeRanges } from "./shared";

type TableRange = { from: number; to: number; rows: string[][] };

function tableRanges(state: EditorState): TableRange[] {
  const lines = state.doc.toString().split("\n");
  const ranges: TableRange[] = [];
  const excluded = codeRanges(state);
  let offset = 0;
  for (let i = 0; i < lines.length; i++) {
    const header = lines[i];
    const separator = lines[i + 1];
    if (
      !separator ||
      !header.includes("|") ||
      !/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(separator)
    ) {
      offset += header.length + 1;
      continue;
    }
    const parse = (line: string) =>
      line
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => cell.trim());
    const rows = [parse(header)];
    let end = i + 2;
    while (
      end < lines.length &&
      lines[end].includes("|") &&
      lines[end].trim()
    ) {
      rows.push(parse(lines[end]));
      end++;
    }
    const to =
      offset +
      lines.slice(i, end).reduce((size, line) => size + line.length + 1, -1);
    if (!excluded.some((range) => offset < range.to && to > range.from))
      ranges.push({ from: offset, to, rows });
    offset = to + 1;
    i = end - 1;
  }
  return ranges;
}

class TableWidget extends WidgetType {
  readonly range: TableRange;
  constructor(range: TableRange) {
    super();
    this.range = range;
  }
  eq(other: TableWidget) {
    return JSON.stringify(this.range.rows) === JSON.stringify(other.range.rows);
  }
  toDOM(view: EditorView) {
    const wrapper = document.createElement("div");
    wrapper.className = "tm-md-table-widget";
    const table = document.createElement("table");
    wrapper.append(table);
    const write = (rows: string[][]) => {
      const width = Math.max(...rows.map((row) => row.length));
      const normalized = rows.map((row) =>
        Array.from({ length: width }, (_, column) => row[column] || ""),
      );
      const content = [
        normalized[0],
        Array(width).fill("---"),
        ...normalized.slice(1),
      ]
        .map((row) => `| ${row.join(" | ")} |`)
        .join("\n");
      view.dispatch({
        changes: { from: this.range.from, to: this.range.to, insert: content },
        annotations: Transaction.userEvent.of("input.type"),
      });
    };
    this.range.rows.forEach((row, rowIndex) => {
      const tr = document.createElement("tr");
      table.append(tr);
      const grip = document.createElement("th");
      grip.textContent = "⋮";
      grip.draggable = rowIndex > 0;
      grip.ondragstart = (event) =>
        event.dataTransfer?.setData("text/table-row", String(rowIndex));
      grip.ondragover = (event) => event.preventDefault();
      grip.ondrop = (event) => {
        event.preventDefault();
        const from = Number(event.dataTransfer?.getData("text/table-row"));
        if (from > 0 && from !== rowIndex && rowIndex > 0) {
          const rows = this.range.rows.map((value) => [...value]);
          rows.splice(rowIndex, 0, rows.splice(from, 1)[0]);
          write(rows);
        }
      };
      tr.append(grip);
      row.forEach((cell, column) => {
        const td = document.createElement(rowIndex ? "td" : "th");
        if (!rowIndex) {
          const handle = document.createElement("span");
          handle.textContent = "⋮ ";
          handle.draggable = true;
          handle.ondragstart = (event) =>
            event.dataTransfer?.setData("text/table-column", String(column));
          handle.ondragover = (event) => event.preventDefault();
          handle.ondrop = (event) => {
            event.preventDefault();
            const from = Number(
              event.dataTransfer?.getData("text/table-column"),
            );
            if (from !== column && from >= 0)
              write(
                this.range.rows.map((cells) => {
                  const copy = [...cells];
                  copy.splice(column, 0, copy.splice(from, 1)[0]);
                  return copy;
                }),
              );
          };
          td.append(handle);
        }
        const input = document.createElement("input");
        input.value = cell;
        // Commit on blur so CodeMirror does not replace the focused grid cell
        // after each keystroke.
        input.onchange = () =>
          write(
            this.range.rows.map((cells, index) =>
              index === rowIndex
                ? cells.map((value, col) =>
                    col === column ? input.value : value,
                  )
                : cells,
            ),
          );
        input.oncontextmenu = (event) => {
          event.preventDefault();
          const choice = prompt("Delete Row or Delete Column?", "Row");
          if (choice?.toLowerCase() === "row" && rowIndex > 0)
            write(this.range.rows.filter((_, index) => index !== rowIndex));
          else if (
            choice?.toLowerCase() === "column" &&
            this.range.rows[0].length > 1
          )
            write(
              this.range.rows.map((cells) =>
                cells.filter((_, index) => index !== column),
              ),
            );
        };
        td.append(input);
        tr.append(td);
      });
    });
    const addRow = document.createElement("button");
    addRow.textContent = "+ row";
    addRow.onclick = () =>
      write([...this.range.rows, Array(this.range.rows[0].length).fill("")]);
    const addColumn = document.createElement("button");
    addColumn.textContent = "+ column";
    addColumn.onclick = () => write(this.range.rows.map((row) => [...row, ""]));
    wrapper.append(addRow, addColumn);
    return wrapper;
  }
  ignoreEvent() {
    return true;
  }
}

// Block decorations must live in a StateField; CodeMirror rejects them
// from view plugins.
export const tableDecorations = StateField.define<DecorationSet>({
  create(state: EditorState) {
    return buildDecorations(state);
  },
  update(value, transaction) {
    if (!transaction.docChanged) return value;
    return buildDecorations(transaction.state);
  },
  provide: (field) => EditorView.decorations.from(field),
});

function buildDecorations(state: EditorState) {
  return Decoration.set(
    tableRanges(state).map((table) =>
      Decoration.replace({
        block: true,
        widget: new TableWidget(table),
      }).range(table.from, table.to),
    ),
    true,
  );
}
