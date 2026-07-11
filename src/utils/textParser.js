export const parseTextWithLinks = (text) => {
    if (!text) return ''

    const escapeHtml = (str) => {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
    }

    let safeText = escapeHtml(text)

    safeText = safeText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="preview-text-link" target="_blank" rel="noopener noreferrer">$1</a>')

    return safeText
}

export const parseTextWithBold = (text) => {
    if (!text) return ''
    return text.replace(/\*(\S[^*]+)\*/g, '<b>$1</b>')
}

export const parseTextWithHtml = (text) => {
    text = parseTextWithLinks(text)
    text = parseTextWithBold(text)
    return text
}

export const getLineType = (line) => {
    const startsWithMark = (str) => /^[-*]\s/.test(str)
    const startsWithNum = (str) => /^[0-9]+[).]\s/.test(str)
    const notEmpty = (str) => /.+/.test(str)

    if (startsWithMark(line)) return 'ul'
    else if (startsWithNum(line)) return 'ol'
    else if (notEmpty(line)) return 'p'
    else return 'empty'
}

export const removeListMarkers = (str) => {
    return str.replace(/^([-*]|[0-9]+[).])\s/, '')
}

export const parseTextBlocks = (text) => {
    const lines = text.split('\n')

    let parsedBlocks = []
    let prevLineType = null
    let hadEmptyLine = false
    let block = null

    let i = 0
    while (i < lines.length) {
        const line = lines[i]
        i++
        const lineType = getLineType(line)

        if (lineType === 'empty') {
            hadEmptyLine = true
            continue
        }

        if (prevLineType === null || lineType !== prevLineType) {
            if (block) {
                parsedBlocks.push(block)
                block = null
            }

            block = { type: lineType }
            if (hadEmptyLine && prevLineType !== null) block.gap = true

            if (lineType === 'p') {
                block.data = parseTextWithHtml(line)
            } else {
                block.data = [parseTextWithHtml(removeListMarkers(line))]
            }
        } else if (lineType === prevLineType) {
            if (lineType === 'p') {
                if (!hadEmptyLine) {
                    block.data += '\n' + parseTextWithHtml(line)
                } else {
                    parsedBlocks.push(block)
                    block = { type: 'p' }
                    if (hadEmptyLine && prevLineType !== null) block.gap = true
                    block.data = parseTextWithHtml(line)
                }
            } else {
                if (!hadEmptyLine) {
                    block.data.push(parseTextWithHtml(removeListMarkers(line)))
                } else {
                    parsedBlocks.push(block)
                    block = { type: lineType }
                    if (prevLineType !== null) block.gap = true
                    block.data = [parseTextWithHtml(removeListMarkers(line))]
                }
            }
        }

        prevLineType = lineType
        hadEmptyLine = false
    }

    if (block) parsedBlocks.push(block)

    return parsedBlocks
}
