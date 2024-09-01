import BrSmall from "../components/BrSmall"
import Heading from "../components/Heading"
import VerticalList from "../components/VerticalList"

export default function Home() {
    return <div>
        <Heading>Arcane Odyssey Guides</Heading>
        <p>This is the homepage</p>
        <div>Check the source code <a target="_blank" href="https://github.com/myaltaccountsthis/arcane-odyssey-guides">here</a></div>
        <br/>
        <div><b>Made by myaltaccountsthis</b></div>
        <BrSmall />
        <VerticalList>
            <div><a href="armor">Armor Builds</a></div>
            <div><a href="treasure">Treasure Chart Locator</a></div>
        </VerticalList>
        <br/>
        <div><b>Made by others</b></div>
        <BrSmall />
        <VerticalList>
            <div>
                <i>Storntreat</i> - <a target="_blank" href="https://docs.google.com/presentation/d/1F8-wjkYacgPZFN31cq05TqTsPN3v3X_gzQxA4RDsjGA/edit?usp=sharing">Wanted Criminal Locations</a>
            </div>
        </VerticalList>
    </div>
}