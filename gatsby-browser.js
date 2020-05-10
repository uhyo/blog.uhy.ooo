import { library } from "@fortawesome/fontawesome-svg-core"
import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons"
import { faHome, faRss, faTags } from "@fortawesome/free-solid-svg-icons"
// do not sort!
import "prismjs/plugins/line-numbers/prism-line-numbers.css"
import "./src/prism-theme/material-dark.css"

library.add(faHome, faRss, faTags, faTwitter, faGithub)
