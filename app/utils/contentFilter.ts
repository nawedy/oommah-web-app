const inappropriateWords = [
  'badword1',
  'badword2',
  'badword3',
  // Add more inappropriate words here
]

export function filterContent(content: string): { isClean: boolean; filteredContent: string } {
  let isClean = true
  let filteredContent = content

  inappropriateWords.forEach(word => {
    const regex = new RegExp(word, 'gi')
    if (regex.test(content)) {
      isClean = false
      filteredContent = filteredContent.replace(regex, '*'.repeat(word.length))
    }
  })

  return { isClean, filteredContent }
}

