/**
 * Appends the text on google scholar showing the citation count for an article
 * @param {HTMLElement} article Reference to a div containing one article on google scholar
 * @param {string} s String to append to the citation text
 */
const append_citation_text = (article, s) => {
  const links = article.getElementsByClassName("gs_fl gs_flb")[0].children
  const citationCountElement = links[2]
  citationCountElement.text += s
}

/**
 * Get the publication year and current citation count for an article on google scholar
 * @param {HTMLElement} article Reference to a div containing one article on google scholar
 * @returns {[number, number]} Array containing year of publication and current citation count
 */
const getYearAndCitations = (article) => {
  const links = article.getElementsByClassName("gs_fl gs_flb")[0].children
  const citationCountElement = links[2]
  const citationCount = citationCountElement.text.split(" ").at(-1)

  const authorDiv = article.getElementsByClassName("gs_a")[0]
  const year = authorDiv.textContent.split("-").at(-2).split(" ").at(-2)

  return [year, citationCount]
}

/**
 * Calculates the expected citation count after 10 years
 * following the gamma distribution in figure 3 in
 * https://doi.org/10.3152/147154403781776645
 * @param {number} citationCount Current citation count
 * @param {number} publicationYear Publication year
 * @returns {number} Expected citation count
 */
const calcExpectedCitations = (citationCount, publicationYear) => {
  const gammaParams = [3.2923, 0.2378, 2.0036]
  const [shape, loc, scale] = gammaParams

  const totalYearsTimeSpan = 10
  const currentYear = new Date().getFullYear()
  const yearsSincePublication = currentYear - publicationYear

  const currentDateRelativeCitations = jStat.gamma.cdf(yearsSincePublication, shape, scale)
  const futureRelativeCitations = jStat.gamma.cdf(totalYearsTimeSpan, shape, scale)

  const expectedRelativeChange = futureRelativeCitations / currentDateRelativeCitations
  const expectedCitations = citationCount * expectedRelativeChange

  return expectedCitations
}

const articles = document.getElementById("gs_res_ccl_mid").children
for (let article of articles) {
  // Filter out divs that do not belong to an article
  if (!article.classList.contains("gs_or")) { continue }

  const [publicationYear, currentCitations] = getYearAndCitations(article)
  console.log(publicationYear, currentCitations)
  const expectedCitations = calcExpectedCitations(currentCitations, publicationYear)
  append_citation_text(article, ` (${expectedCitations.toFixed(0)})`)
}



