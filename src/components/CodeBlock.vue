<script setup>
import { ref } from 'vue'

import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml' // HTML
import css from 'highlight.js/lib/languages/css'
import 'highlight.js/styles/github.css'

const props = defineProps({
    block: Object
})

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('css', css)

const codeHighlight = (block) => {
    let raw = block.data.trim()
    raw = block.data.trim().replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    const result = hljs.highlightAuto(raw)
    return result
}

const copiedBlockId = ref(null)

const copyCode = async (block) => {
    const code = block.data

    try {
        await navigator.clipboard.writeText(code)
    } catch {
        const textarea = document.createElement('textarea')
        textarea.value = code
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
    }

    copiedBlockId.value = block.id

    setTimeout(() => {
        if (copiedBlockId.value === block.id) {
            copiedBlockId.value = null
        }
    }, 1000)
}
</script>

<template>
    <div class="code-block">
        <div class="preview-code-header">
            <div class="preview-code-lang">{{ codeHighlight(block).language || '&lt;/&gt;' }}</div>
            <div class="preview-code-copy" :class="{ copied: copiedBlockId === block.id }" @click="copyCode(block)">
                {{ copiedBlockId === block.id ? 'Скопировано' : 'Копировать' }}
            </div>
        </div>
        <pre><code v-html="codeHighlight(block).value"></code></pre>
    </div>
</template>

<style scoped>
.preview-code {
    background: #f9fafb;
    border-radius: 12px;
    padding: 0.5rem 1rem 1rem;
}
.preview-code-header {
    display: flex;
    justify-content: space-between;
    color: #0f1115;
    margin-bottom: 1rem;
}
.preview-code-lang {
    font-size: 0.75rem;
}
.preview-code-copy {
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
    padding: 0.25rem 1rem;
    color: #61666b;
    cursor: pointer;
}
.preview-code-copy:not(.copied):hover {
    background: rgb(38 49 72 / 6%);
}
.preview-code-copy.copied {
    color: #55bf55;
    cursor: default;
}
.preview-code pre {
    tab-size: 2;
    font-size: 0.9rem;
    white-space: pre-wrap;
    font-family: monospace;
}
</style>
