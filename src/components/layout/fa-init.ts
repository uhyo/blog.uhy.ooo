import { config, library } from "@fortawesome/fontawesome-svg-core"
import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons"
import { faHome, faRss, faTags } from "@fortawesome/free-solid-svg-icons"

config.autoAddCss = false

library.add(faHome, faRss, faTags, faTwitter, faGithub)
