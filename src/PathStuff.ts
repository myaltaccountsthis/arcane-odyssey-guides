const paths = {
    armor: "./",
    armorFile: "./info.json",
    treasure: "./",
};

if (window.location.hostname == "localhost") {
    paths.armor = "./armor/";
    paths.armorFile = "./armor/info.json";
    paths.treasure = "./treasure/";
}

/*
if (window.location.hostname == "myaltaccountsthis.github.io") {
    paths.armor = "../armor/";
    paths.armorFile = "../armor/info.json";
    paths.treasure = "../treasure/"
}
*/

export default paths;