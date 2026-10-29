// components/RichTextEditor.tsx
'use client'

import { useEffect } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  Bold,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Undo2,
} from 'lucide-react'

interface Props {
  value: string
  onChange: (html: string) => void
  labelledBy: string
  disabled?: boolean
  invalid?: boolean
}

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-brand-dark transition focus-ring disabled:opacity-40 ${
        active ? 'bg-brand-primary text-white' : 'hover:bg-brand-wood/30'
      }`}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor, disabled }: { editor: Editor; disabled: boolean }) {
  const run = (fn: (chain: ReturnType<Editor['chain']>) => ReturnType<Editor['chain']>) => () =>
    fn(editor.chain().focus()).run()

  return (
    <div role="toolbar" aria-label="Formato del texto" className="flex flex-wrap items-center gap-1 border-b border-brand-wood/60 bg-brand-cream/60 p-1.5">
      <ToolbarButton label="Negrita" active={editor.isActive('bold')} disabled={disabled} onClick={run((c) => c.toggleBold())}>
        <Bold className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Cursiva" active={editor.isActive('italic')} disabled={disabled} onClick={run((c) => c.toggleItalic())}>
        <Italic className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-brand-wood/60" aria-hidden="true" />
      <ToolbarButton label="Título (H2)" active={editor.isActive('heading', { level: 2 })} disabled={disabled} onClick={run((c) => c.toggleHeading({ level: 2 }))}>
        <Heading2 className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Subtítulo (H3)" active={editor.isActive('heading', { level: 3 })} disabled={disabled} onClick={run((c) => c.toggleHeading({ level: 3 }))}>
        <Heading3 className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-brand-wood/60" aria-hidden="true" />
      <ToolbarButton label="Alinear a la izquierda" active={editor.isActive({ textAlign: 'left' })} disabled={disabled} onClick={run((c) => c.setTextAlign('left'))}>
        <AlignLeft className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Centrar" active={editor.isActive({ textAlign: 'center' })} disabled={disabled} onClick={run((c) => c.setTextAlign('center'))}>
        <AlignCenter className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Justificar" active={editor.isActive({ textAlign: 'justify' })} disabled={disabled} onClick={run((c) => c.setTextAlign('justify'))}>
        <AlignJustify className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-brand-wood/60" aria-hidden="true" />
      <ToolbarButton label="Lista con viñetas" active={editor.isActive('bulletList')} disabled={disabled} onClick={run((c) => c.toggleBulletList())}>
        <List className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Lista numerada" active={editor.isActive('orderedList')} disabled={disabled} onClick={run((c) => c.toggleOrderedList())}>
        <ListOrdered className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-brand-wood/60" aria-hidden="true" />
      <ToolbarButton label="Deshacer" disabled={disabled || !editor.can().undo()} onClick={run((c) => c.undo())}>
        <Undo2 className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton label="Rehacer" disabled={disabled || !editor.can().redo()} onClick={run((c) => c.redo())}>
        <Redo2 className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
    </div>
  )
}

export default function RichTextEditor({ value, onChange, labelledBy, disabled = false, invalid = false }: Props) {
  const editor = useEditor({
    immediatelyRender: false, // evita desajuste de hidratación en Next App Router
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value,
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-labelledby': labelledBy,
        class: 'rich-text min-h-[10rem] px-3 py-2 focus:outline-none',
      },
    },
    onUpdate: ({ editor: ed }) => onChange(ed.isEmpty ? '' : ed.getHTML()),
  })

  useEffect(() => {
    editor?.setEditable(!disabled)
  }, [editor, disabled])

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white shadow-sm focus-within:ring-2 focus-within:ring-brand-primary ${
        invalid ? 'border-red-600' : 'border-brand-wood'
      }`}
    >
      {editor && <Toolbar editor={editor} disabled={disabled} />}
      <EditorContent editor={editor} />
    </div>
  )
}
