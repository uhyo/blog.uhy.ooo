import { icon, IconProp } from "@fortawesome/fontawesome-svg-core"
import React from "react"

type Props = {
  icon: IconProp
}

/**
 * fontawesome icon for gatsby
 */
export const FaIcon: React.FunctionComponent<Props> = ({
  icon: iconLookup,
}) => {
  const ic = getIcon(iconLookup)
  return <span dangerouslySetInnerHTML={{ __html: ic.html.join("") }} />
}

const getIcon = (iconLookup: IconProp) => {
  if (Array.isArray(iconLookup)) {
    const [prefix, iconName] = iconLookup
    return icon({
      prefix,
      iconName,
    })
  } else if (typeof iconLookup === "string") {
    return icon({
      prefix: "fas",
      iconName: iconLookup,
    })
  } else {
    return icon(iconLookup)
  }
}
