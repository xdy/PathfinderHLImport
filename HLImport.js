/* Notes Section

!import ?{Melee Stat?|str} ?{Ranged Stat?|dex} ?{CMB Stat?|str} ?{Caster Class 1 Stat?|none} ?{Caster Class 2 Stat?|none}

*/

// Functions
var AddAttribute = AddAttribute || {};
function AddAttribute(attr, value, charid) {
	createObj("attribute", {
		name: attr,
		current: value,
		characterid: charid
	});
	return;
}



// Main
on("chat:message", function (msg) {
    // Exit if not an api command
    if (msg.type != "api") return;

    // Get the API Chat Command
	msg.who = msg.who.replace(" (GM)", "");
	msg.content = msg.content.replace("(GM) ", "");
	var command = msg.content.split(" ");

    // check that the command arguments are valid
    for (var cm = 1; cm < 6; cm++) {
        if (command[cm] === "str" || command[cm] === "dex" || command[cm] === "con" || command[cm] === "int" || command[cm] === "wis" || command[cm] === "cha" || command[cm] === "none") {
            var ParameterCheck = 0;
        } else {
            sendChat("ERROR", "Command argument " + cm + " is invalid, please choose from str, dex, con, int, wis, cha, or none.");
            var ParameterCheck = 1;
            return;
        };
    };
    // return based on an error in the command argument check validation
    if (ParameterCheck != 0) return;
    
    // set values based on command argument
    if (command[1] === "none") {
        var AttkMeleeAbility = "0";
    } else {
        var AttkMeleeAbility = "@{" + command[1].toUpperCase() + "-mod}";
    };
    if (command[2] === "none") {
        var AttkRangedAbility = "0";
    } else {
        var AttkRangedAbility = "@{" + command[2].toUpperCase() + "-mod}";
    };
    if (command[3] === "none") {
        var AttkCMBAbility = "0";
    } else {
        var AttkCMBAbility = "@{" + command[3].toUpperCase() + "-mod}";
    };    
    if (command[4] === "none") {
        var Concentration0Ability = "0";
    } else {
        var Concentration0Ability = "(@{" + command[4].toUpperCase() + "-mod})";
        var Concentration0AbilityMod = command[4];
    };
    if (command[5] === "none") {
        var Concentration1Ability = "0";
    } else {
        var Concentration1Ability = "(@{" + command[5].toUpperCase() + "-mod})";
        var Concentration1AbilityMod = command[5];
    };

	if (command[0] == "!import") {
		if (!msg.selected) return;
        var token = getObj('graphic', msg.selected[0]._id);
		if (token.get("subtype") != "token") return;
        var StatBlock = token.get("gmnotes");
        
        // REPLACE SPECIAL CHARACTERS StatBlock = StatBlock.replace(//g, "");
		StatBlock = StatBlock.replace(/%20/g, " "); // Replace %20 with a space
		StatBlock = StatBlock.replace(/%22/g, "'"); // Replace %22 (quotation) with '
		StatBlock = StatBlock.replace(/%26lt/g, "<"); // Replace %26lt with <
		StatBlock = StatBlock.replace(/%26gt/g, ">"); // Replace %26gt with >
		StatBlock = StatBlock.replace(/%27/g, "'"); // Replace %27 with '
		StatBlock = StatBlock.replace(/%28/g, "("); // Replace %28 with (
		StatBlock = StatBlock.replace(/%29/g, ")"); // Replace %29 with )
		StatBlock = StatBlock.replace(/%2C/g, ","); // Replace %2C with ,
		StatBlock = StatBlock.replace(/%3A/g, ":"); // Replace %3A with :
		StatBlock = StatBlock.replace(/%3B/g, ""); // Remove %3B (semi-colon)
		StatBlock = StatBlock.replace(/%3Cbr/g, ""); // Remove carriage returns
		StatBlock = StatBlock.replace(/%3D/g, "="); // Replace %3D with =
		StatBlock = StatBlock.replace(/%3E/g, ""); // Remove %3E (???)
		StatBlock = StatBlock.replace(/%3F/g, "?"); // Replace %3F with ?
		StatBlock = StatBlock.replace(/\s{2,}/g, " "); // Replace multiple spaces with one space
		StatBlock = StatBlock.replace(/%u2019/g, "'"); // Replace %u2019 with '
        StatBlock = StatBlock.replace(/%26quot/g, "'"); // Replace %26quot with '
        StatBlock = StatBlock.replace(/%u2014/g, "--"); // Replace %u2014 with --
        StatBlock = StatBlock.replace(/%26amp/g, "&"); // Replace %26amp with &
        StatBlock = StatBlock.replace(/%u2013/g, "-"); // Replace %u2013 with -
		// END SPECIAL CHARACTER REPLACEMENT or REMOVAL
        
        // Get Character Name, Create Sheet, Link token to Character Sheet if the Character Name doesn't already exist
        var CharacterName = StatBlock.match(/<character(.*?)>/g).pop().split("name='")[1].split("'", 1)[0];
        var CheckSheet = findObjs({
            _type: "character",
            name: CharacterName
        });
        
        if (CheckSheet.length > 0) {
            sendChat("ERROR", "This character already exists.");
            return;
        };
        
        var Character = createObj("character", {
            avatar: token.get("imgsrc"),
            name: CharacterName,
            archived: false
        });
        
        //  Fill in the remainder of the character details
        var RaceName = StatBlock.match(/<race(.*?)>/g).pop().split("name='")[1].split("'", 1)[0];
        AddAttribute("race", RaceName, Character.id);
        var GenderName = "none";
        if (StatBlock.match(/gender='(.*?)'/g) != null) {
            var GenderName = StatBlock.match(/<personal(.*?)>/g).pop().split("gender='")[1].split("'", 1)[0];
        };
        AddAttribute("gender", GenderName, Character.id);
        var AlignmentName = StatBlock.match(/<alignment(.*?)>/g).pop().split("name='")[1].split("'", 1)[0];
        AddAttribute("alignment", AlignmentName, Character.id);
        var SizeName = StatBlock.match(/<size(.*?)>/g).pop().split("name='")[1].split("'", 1)[0];
        // Need to translate size into value
        var SizeValue;
            if (SizeName === "Fine") {
                SizeValue = "8"
            } else if (SizeName == "Diminutive") {
                SizeValue = "4"
            } else if (SizeName == "Tiny") {
                SizeValue = "2"
            } else if (SizeName == "Small") {
                SizeValue = "1"
            } else if (SizeName == "Large") {
                SizeValue = "-1"
            } else if (SizeName == "Huge") {
                SizeValue = "-2"
            } else if (SizeName == "Gargantuan") {
                SizeValue = "-4"
            } else if (SizeName == "Colossal") {
                SizeValue = "-8"
            } else {
                SizeValue = "0"
            };
        AddAttribute("size", SizeValue, Character.id);
        var HeightName = StatBlock.match(/<charheight(.*?)>/g).pop().split("text='")[1].split("''", 1)[0];
        HeightName = HeightName + '"' // need to figure out how to split differently or add a " properly :(
        AddAttribute("height", HeightName, Character.id);
        var WeightName = StatBlock.match(/<charweight(.*?)>/g).pop().split("text='")[1].split("'", 1)[0];
        AddAttribute("weight", WeightName, Character.id);
        var HairName = StatBlock.match(/<personal(.*?)>/g).pop().split("hair='")[1].split("'", 1)[0];
        AddAttribute("hair", HairName, Character.id);
        var EyesName = StatBlock.match(/<personal(.*?)>/g).pop().split("eyes='")[1].split("'", 1)[0];
        AddAttribute("eyes", EyesName, Character.id);
        var SkinName = StatBlock.match(/<personal(.*?)>/g).pop().split("skin='")[1].split("'", 1)[0];
        AddAttribute("skin", SkinName, Character.id);
        var AgeName = StatBlock.match(/<personal(.*?)>/g).pop().split("age='")[1].split("'", 1)[0];
        AddAttribute("age", AgeName, Character.id);
		var DeityName = StatBlock.match(/<deity(.*?)>/g).pop().split("name='")[1].split("'", 1)[0];
        AddAttribute("deity", DeityName, Character.id);
        // Homeland - Need to implement
        // Occupation - Need to implement
        
        // Build Languages List
        var Languages = StatBlock.match(/<language name='(.*?)'/g);
        var LanguagesName = "";
        for (var l = Languages.length; --l > -1;) {
            LanguagesTemp = Languages[l].match(/name='(.*?)'/g).pop().split("name='")[1].split("'", 1)[0];
            LanguagesName = LanguagesTemp + ", " + LanguagesName;
        }; 
        AddAttribute("languages", LanguagesName, Character.id);
        
        // Ability Scores
        var StrValue = StatBlock.match(/<attribute(.*?)name='Strength'>(.*?)<\/attribute>/g).pop().match(/<attrvalue (.*?)>/g).pop().split("base='")[1].split("'", 1)[0];
        var StrModValue = StatBlock.match(/<attribute(.*?)name='Strength'>(.*?)<\/attribute>/g).pop().match(/<attrvalue (.*?)>/g).pop().split("modified='")[1].split("'", 1)[0];
        var StrBonus = StatBlock.match(/<attribute(.*?)name='Strength'>(.*?)<\/attribute>/g).pop().match(/<attrbonus (.*?)>/g).pop().split("modified='")[1].split("'", 1)[0].replace("+", "");
        var StrEnhBonus = 0;
        if (StrModValue > StrValue) {
            var StrEnhBonus = StrModValue - StrValue;
        };
        AddAttribute("STR-base", StrValue, Character.id);
        AddAttribute("STR-enhance", StrEnhBonus, Character.id);
        
        var DexValue = StatBlock.match(/<attribute(.*?)name='Dexterity'>(.*?)<\/attribute>/g).pop().match(/<attrvalue (.*?)>/g).pop().split("base='")[1].split("'", 1)[0];
        var DexModValue = StatBlock.match(/<attribute(.*?)name='Dexterity'>(.*?)<\/attribute>/g).pop().match(/<attrvalue (.*?)>/g).pop().split("modified='")[1].split("'", 1)[0];
        var DexBonus = StatBlock.match(/<attribute(.*?)name='Dexterity'>(.*?)<\/attribute>/g).pop().match(/<attrbonus (.*?)>/g).pop().split("modified='")[1].split("'", 1)[0].replace("+", "");
        var DexEnhBonus = 0;
        if (DexModValue > DexValue) {
            var DexEnhBonus = DexModValue - DexValue;
        };
        AddAttribute("DEX-base", DexValue, Character.id);
        AddAttribute("DEX-enhance", DexEnhBonus, Character.id);
        
        var ConValue = StatBlock.match(/<attribute(.*?)name='Constitution'>(.*?)<\/attribute>/g).pop().match(/<attrvalue (.*?)>/g).pop().split("base='")[1].split("'", 1)[0];
        var ConModValue = StatBlock.match(/<attribute(.*?)name='Constitution'>(.*?)<\/attribute>/g).pop().match(/<attrvalue (.*?)>/g).pop().split("modified='")[1].split("'", 1)[0];
        var ConBonus = StatBlock.match(/<attribute(.*?)name='Constitution'>(.*?)<\/attribute>/g).pop().match(/<attrbonus (.*?)>/g).pop().split("modified='")[1].split("'", 1)[0].replace("+", "");
        var ConEnhBonus = 0;
        if (ConModValue > ConValue) {
            var ConEnhBonus = ConModValue - ConValue;
        };
        AddAttribute("CON-base", ConValue, Character.id);
        AddAttribute("CON-enhance", ConEnhBonus, Character.id);
        
        var IntValue = StatBlock.match(/<attribute(.*?)name='Intelligence'>(.*?)<\/attribute>/g).pop().match(/<attrvalue (.*?)>/g).pop().split("base='")[1].split("'", 1)[0];
        var IntModValue = StatBlock.match(/<attribute(.*?)name='Intelligence'>(.*?)<\/attribute>/g).pop().match(/<attrvalue (.*?)>/g).pop().split("modified='")[1].split("'", 1)[0];
        var IntBonus = StatBlock.match(/<attribute(.*?)name='Intelligence'>(.*?)<\/attribute>/g).pop().match(/<attrbonus (.*?)>/g).pop().split("modified='")[1].split("'", 1)[0].replace("+", "");
        var IntEnhBonus = 0;
        if (IntModValue > IntValue) {
            var IntEnhBonus = IntModValue - IntValue;
        };
        AddAttribute("INT-base", IntValue, Character.id);
        AddAttribute("INT-enhance", IntEnhBonus, Character.id);
        
        var WisValue = StatBlock.match(/<attribute(.*?)name='Wisdom'>(.*?)<\/attribute>/g).pop().match(/<attrvalue (.*?)>/g).pop().split("base='")[1].split("'", 1)[0];
        var WisModValue = StatBlock.match(/<attribute(.*?)name='Wisdom'>(.*?)<\/attribute>/g).pop().match(/<attrvalue (.*?)>/g).pop().split("modified='")[1].split("'", 1)[0];
        var WisBonus = StatBlock.match(/<attribute(.*?)name='Wisdom'>(.*?)<\/attribute>/g).pop().match(/<attrbonus (.*?)>/g).pop().split("modified='")[1].split("'", 1)[0].replace("+", "");
        var WisEnhBonus = 0;
        if (WisModValue > WisValue) {
            var WisEnhBonus = WisModValue - WisValue;
        };
        AddAttribute("WIS-base", WisValue, Character.id);
        AddAttribute("WIS-enhance", WisEnhBonus, Character.id);
        
        var ChaValue = StatBlock.match(/<attribute(.*?)name='Charisma'>(.*?)<\/attribute>/g).pop().match(/<attrvalue (.*?)>/g).pop().split("base='")[1].split("'", 1)[0];
        var ChaModValue = StatBlock.match(/<attribute(.*?)name='Charisma'>(.*?)<\/attribute>/g).pop().match(/<attrvalue (.*?)>/g).pop().split("modified='")[1].split("'", 1)[0];
        var ChaBonus = StatBlock.match(/<attribute(.*?)name='Charisma'>(.*?)<\/attribute>/g).pop().match(/<attrbonus (.*?)>/g).pop().split("modified='")[1].split("'", 1)[0].replace("+", "");
        var ChaEnhBonus = 0;
        if (ChaModValue > ChaValue) {
            var ChaEnhBonus = ChaModValue - ChaValue;
        };
        AddAttribute("CHA-base", ChaValue, Character.id);
        AddAttribute("CHA-enhance", ChaEnhBonus, Character.id);
            
        // Class Information
        if (StatBlock.match(/<class (.*?)name='(.*?)>/g) != null) {
            var Classes = StatBlock.match(/<class (.*?)name='(.*?)>/g);
            // Caster level counter
            var cl = 0;
            for (var c = 0; c < Classes.length; c++){
                var ClassesName = "";
                var ClassesLevel = "";
                var ClassesCasterLevel = "";
                var ClassesCasterLevelBonus = "";
                var ClassesConcentrationBonus = "";
                ClassesName = Classes[c].match(/name='(.*?)'/g).pop().split("name='")[1].split("'", 1)[0];
                AddAttribute("class-" + c + "-name", ClassesName, Character.id);
                // Need to save the class names associated with their number for populating Class Abilities Section
                if (c === 0) {
                    Class0 = ClassesName;
                } else if (c === 1) {
                    Class1 = ClassesName;
                } else if (c === 2) {
                    Class2 = ClassesName;
                } else if (c === 3) {
                    Class3 = ClassesName;
                } else if (c === 4) {
                    Class4 = ClassesName;
                };
                ClassesLevel = Classes[c].match(/ level='(.*?)'/g).pop().split(" level='")[1].split("'", 1)[0];
                AddAttribute("class-" + c + "-level", ClassesLevel, Character.id);
                ClassesCasterLevel = Classes[c].match(/casterlevel='(.*?)'/g).pop().split("casterlevel='")[1].split("'", 1)[0];
                if (parseInt(ClassesCasterLevel) > 0) {
                    AddAttribute("spellclass-" + cl + "-name", ClassesName, Character.id);
                    AddAttribute("spellclass-" + cl + "-level", ClassesCasterLevel, Character.id);
                    // Determine ClassesCasterLevelBonus
                    if (Classes[c].indexOf("overcomespellresistance='") >= 0){
                        ClassesCasterLevelBonus = Classes[c].split("overcomespellresistance='")[1].split("'", 1)[0].replace("+", "");
                        ClassesCasterLevelBonus = ClassesCasterLevelBonus - ClassesCasterLevel;
                        AddAttribute("spellclass-" + cl + "-level-misc", ClassesCasterLevelBonus, Character.id);
                    };
                    // Caster Stat comes from command arguments
                    if (Classes[c].indexOf("concentrationcheck='") >= 0){
                        if (cl == 0) {
                            var ConcentrationAbility = Concentration0Ability
                            if (Concentration0AbilityMod === "str") {
                                var ConcentrationAbilityBonus = StrBonus;
                            } else if (Concentration0AbilityMod === "dex") {
                                var ConcentrationAbilityBonus = DexBonus;
                            } else if (Concentration0AbilityMod === "con") {
                                var ConcentrationAbilityBonus = ConBonus;
                            } else if (Concentration0AbilityMod === "int") {
                                var ConcentrationAbilityBonus = IntBonus;
                            } else if (Concentration0AbilityMod === "wis") {
                                var ConcentrationAbilityBonus = WisBonus;
                            } else if (Concentration0AbilityMod === "cha") {
                                var ConcentrationAbilityBonus = ChaBonus;
                            } else {
                                var ConcentrationAbilityBonus = "0";
                            };
                        } else if (cl == 1) {
                            var ConcentrationAbility = Concentration1Ability
                            if (Concentration1AbilityMod === "str") {
                                var ConcentrationAbilityBonus = StrBonus
                            } else if (Concentration1AbilityMod === "dex") {
                                var ConcentrationAbilityBonus = DexBonus
                            } else if (Concentration1AbilityMod === "con") {
                                var ConcentrationAbilityBonus = ConBonus
                            } else if (Concentration1AbilityMod === "int") {
                                var ConcentrationAbilityBonus = IntBonus
                            } else if (Concentration1AbilityMod === "wis") {
                                var ConcentrationAbilityBonus = WisBonus
                            } else if (Concentration1AbilityMod === "cha") {
                                var ConcentrationAbilityBonus = ChaBonus
                            } else {
                                var ConcentrationAbilityBonus = "0";
                            };
                        };
                    ClassesConcentrationBonus = Classes[c].split("concentrationcheck='")[1].split("'", 1)[0].replace("+", "");
                    ClassesConcentrationBonus = ClassesConcentrationBonus - ClassesCasterLevel - ConcentrationAbilityBonus;
                    AddAttribute("Concentration-" + cl + "-ability", ConcentrationAbility, Character.id);
                    AddAttribute("Concentration-" + cl + "-misc", ClassesConcentrationBonus, Character.id);
                    };  
                    // Setup Spells per day
                    if (StatBlock.indexOf("<spellclasses\/>") < 0) {
                        if (StatBlock.indexOf("<spellclasses><\/spellclasses>") < 0) {
                            var SpellClass = StatBlock.match(/<spellclass (.*?)<\/spellclass>/g).pop().split("<spelllevel ");
                            //var MaxSpellLevel = SpellClass[0].split("maxspelllevel='")[1].split("'", 1)[0];
                            //log (MaxSpellLevel);
                            for (var spl = 1; spl < SpellClass.length; spl++){
                                var SpellLevel = "";
                                var SpellMaxCasts = "";
                                var BonusSpells = "";
                                var SpellLevel = SpellClass[spl].split("level='")[1].split("'", 1)[0];
                                if (SpellClass[spl].indexOf("unlimited='yes'") >= 0) {
                                    SpellMaxCasts = "0";
                                } else {
                                    SpellMaxCasts = SpellClass[spl].split("maxcasts='")[1].split("'", 1)[0];
                                };
                                // no bonus 0-level spells
                                if (SpellLevel === "0"){
                                    AddAttribute("spellclass-" + cl + "-level-0-class", SpellMaxCasts, Character.id);
                                } else {
                                    // calculate bonus spells
                                    var BonusSpells = Math.ceil((ConcentrationAbilityBonus - SpellLevel + 1)/4);
                                    SpellMaxCasts = SpellMaxCasts - BonusSpells;
                                    AddAttribute("spellclass-" + cl + "-level-" + SpellLevel +"-class", SpellMaxCasts, Character.id);
                                };
                            };
                        };
                    };
                    if (StatBlock.indexOf("<spellsknown\/>") < 0) {
                        if (StatBlock.indexOf("<spellsknown><\/spellsknown>") < 0) {
                            var SpellsKnown = StatBlock.match(/<spellsknown>(.*?)<\/spellsknown>/g).pop().split("<spell ").toString();
                            Level0Known = "";
                            Level1Known = "";
                            Level2Known = "";
                            Level3Known = "";
                            Level4Known = "";
                            Level5Known = "";
                            Level6Known = "";
                            Level7Known = "";
                            Level8Known = "";
                            Level9Known = "";
                            if (SpellsKnown.indexOf(" level='0'") >= 0) {
                                var Level0Known = 0;
                                Level0Known = SpellsKnown.match(/ level='0'/g).length;
                                AddAttribute("spellclass-" + cl + "-level-0-spells-known", Level0Known, Character.id);
                            };
                            if (SpellsKnown.indexOf(" level='1'") >= 0) {
                                var Level1Known = 0;
                                Level1Known = SpellsKnown.match(/ level='1'/g).length;
                                AddAttribute("spellclass-" + cl + "-level-1-spells-known", Level1Known, Character.id);
                            };
                            if (SpellsKnown.indexOf(" level='2'") >= 0) {
                                var Level2Known = 0;
                                Level2Known = SpellsKnown.match(/ level='2'/g).length;
                                AddAttribute("spellclass-" + cl + "-level-2-spells-known", Level2Known, Character.id);
                            };
                            if (SpellsKnown.indexOf(" level='3'") >= 0) {
                                var Level3Known = 0;
                                Level3Known = SpellsKnown.match(/ level='3'/g).length;
                                AddAttribute("spellclass-" + cl + "-level-3-spells-known", Level3Known, Character.id);
                            }; 
                            if (SpellsKnown.indexOf(" level='4'") >= 0) {
                                var Level4Known = 0;
                                Level4Known = SpellsKnown.match(/ level='4'/g).length;
                                AddAttribute("spellclass-" + cl + "-level-4-spells-known", Level4Known, Character.id);
                            };
                            if (SpellsKnown.indexOf(" level='5'") >= 0) {
                                var Level5Known = 0;
                                Level5Known = SpellsKnown.match(/ level='5'/g).length;
                                AddAttribute("spellclass-" + cl + "-level-5-spells-known", Level5Known, Character.id);
                            };
                            if (SpellsKnown.indexOf(" level='6'") >= 0) {
                                var Level6Known = 0;
                                Level6Known = SpellsKnown.match(/ level='6'/g).length;
                                AddAttribute("spellclass-" + cl + "-level-6-spells-known", Level6Known, Character.id);
                            };
                            if (SpellsKnown.indexOf(" level='7'") >= 0) {
                                var Level7Known = 0;
                                Level7Known = SpellsKnown.match(/ level='7'/g).length;
                                AddAttribute("spellclass-" + cl + "-level-7-spells-known", Level7Known, Character.id);
                            };
                            if (SpellsKnown.indexOf(" level='8'") >= 0) {
                                var Level8Known = 0;
                                Level8Known = SpellsKnown.match(/ level='8'/g).length;
                                AddAttribute("spellclass-" + cl + "-level-8-spells-known", Level8Known, Character.id);
                            };
                            if (SpellsKnown.indexOf(" level='9'") >= 0) {
                                var Level9Known = 0;
                                Level9Known = SpellsKnown.match(/ level='9'/g).length;
                                AddAttribute("spellclass-" + cl + "-level-9-spells-known", Level9Known, Character.id);
                            };
                        };
                    };
                cl = (cl + 1);
                };
            };
        };
        
        // Build Favored Classes list
        if (StatBlock.match(/<favoredclass (.*?)name='(.*?)'/g) != null){
            var FavoredClass = StatBlock.match(/<favoredclass (.*?)name='(.*?)'/g);
            var FavoredClassName = "";
            for (var fc = 0; fc < FavoredClass.length; fc++){
                FavoredClassTemp = FavoredClass[fc].match(/name='(.*?)'/g).pop().split("name='")[1].split("'", 1)[0];
                FavoredClassName = FavoredClassName + FavoredClassTemp + " ";
            };
            AddAttribute("class-favored", FavoredClassName, Character.id);
        };
        // Calcluate HP for Class Information Section, cannot break down by individual classes with multiclass, then
        // add it to the class-0-hp line.
        var HitDieBonus = StatBlock.match(/<health(.*?)>/g).pop().split("hitdice='")[1].split("'", 1)[0];
        HitDieBonus = HitDieBonus.split("+");
        if (HitDieBonus[HitDieBonus.length-1].match(/d/g)) {
            HitDieBonus = "0";
        } else {
            HitDieBonus = HitDieBonus[HitDieBonus.length-1]
        };
        var HitPoints = StatBlock.match(/<health(.*?)>/g).pop().split("hitpoints='")[1].split("'", 1)[0];
        var HitPointsBase = HitPoints - HitDieBonus
        var CurrentHP = StatBlock.match(/<health(.*?)>/g).pop().split("currenthp='")[1].split("'", 1)[0];
        AddAttribute("class-0-hp", HitPointsBase, Character.id);
        AddAttribute("HP", CurrentHP, Character.id);
        
        // If Characters Total Level is 0, assume this is an NPC, then use the Hit Die to set MaxHP correctly.
        var ClassesTotalLevel = StatBlock.match(/<classes (.*?)level='(.*?)>/g).pop().split("level='")[1].split("'", 1)[0];
        if (ClassesTotalLevel == "0") {
            var ClassesTotalLevel = StatBlock.match(/<health (.*?)\/>/g).pop().split("hitdice='")[1].split("d", 1)[0];
            AddAttribute("class-0-level", ClassesTotalLevel, Character.id);
        };
        
        // In the case of Constructs and Undead, Constitution is a "-", in this case I am again working around this by
        // setting the HP Formula == HitPoint
        var ConHPCheck = StatBlock.match(/<attribute(.*?)name='Constitution'>(.*?)<\/attribute>/g).pop().match(/<attrvalue (.*?)>/g).pop().split("text='")[1].split("'", 1)[0];
        if (ConHPCheck === "-") {
            AddAttribute("HP-formula", HitPoints, Character.id);
        };
        
        // Check for temporary HP as best we can calculate, but this currently assume CON is used for HP,
        // so TempHP could be off if you don't use CON as your HP modifier.
        var TempHP = 0
        if (ConHPCheck !== "-"){
            if (parseInt(HitDieBonus) !== (parseInt(ClassesTotalLevel) * parseInt(ConBonus))){
                var TempHP = parseInt(HitDieBonus) - (parseInt(ClassesTotalLevel) * parseInt(ConBonus))
            };
        AddAttribute("HP-Temp", TempHP, Character.id);
        };
        
        // Add Cumulative BAB to class-0 line.
        var BaseAttackBonus = StatBlock.match(/<attack (.*?)>/g).pop().split("baseattack='")[1].split("'", 1)[0].replace("+", "");
        AddAttribute("class-0-bab", BaseAttackBonus, Character.id);
        
        // Add Cumulative Base Saves to class-0, but also add Misc Save and Resistance Save bonuses to Saving Throws
        var BaseFortSave = StatBlock.match(/<save name='Fortitude Save'(.*?)>/g).pop().split("base='")[1].split("'", 1)[0].replace("+", "");
        var MiscFortSave = StatBlock.match(/<save name='Fortitude Save'(.*?)>/g).pop().split("frommisc='")[1].split("'", 1)[0].replace("+", "");
        var ResistFortSave = StatBlock.match(/<save name='Fortitude Save'(.*?)>/g).pop().split("fromresist='")[1].split("'", 1)[0].replace("+", "");
        AddAttribute("class-0-Fort", BaseFortSave, Character.id);
        AddAttribute("Fort-misc", MiscFortSave, Character.id);
        AddAttribute("Fort-resist", ResistFortSave, Character.id);
        var BaseRefSave = StatBlock.match(/<save name='Reflex Save'(.*?)>/g).pop().split("base='")[1].split("'", 1)[0].replace("+", "");
        var MiscRefSave = StatBlock.match(/<save name='Reflex Save'(.*?)>/g).pop().split("frommisc='")[1].split("'", 1)[0].replace("+", "");
        var ResistRefSave = StatBlock.match(/<save name='Reflex Save'(.*?)>/g).pop().split("fromresist='")[1].split("'", 1)[0].replace("+", "");
        AddAttribute("class-0-Ref", BaseRefSave, Character.id);
        AddAttribute("Ref-misc", MiscRefSave, Character.id);
        AddAttribute("Ref-resist", ResistRefSave, Character.id);
        var BaseWillSave = StatBlock.match(/<save name='Will Save'(.*?)>/g).pop().split("base='")[1].split("'", 1)[0].replace("+", "");
        var MiscWillSave = StatBlock.match(/<save name='Will Save'(.*?)>/g).pop().split("frommisc='")[1].split("'", 1)[0].replace("+", "");
        var ResistWillSave = StatBlock.match(/<save name='Will Save'(.*?)>/g).pop().split("fromresist='")[1].split("'", 1)[0].replace("+", "");
        AddAttribute("class-0-Will", BaseWillSave, Character.id);
        AddAttribute("Will-misc", MiscWillSave, Character.id);
        AddAttribute("Will-resist", ResistWillSave, Character.id);
        
        // Currency and Experience
        var MoneyCP = StatBlock.match(/<money total='(.*?)>/g).pop().split("cp='")[1].split("'", 1)[0];
        AddAttribute("CP", MoneyCP, Character.id);
        var MoneySP = StatBlock.match(/<money total='(.*?)>/g).pop().split("sp='")[1].split("'", 1)[0];
        AddAttribute("SP", MoneySP, Character.id);
        var MoneyGP = StatBlock.match(/<money total='(.*?)>/g).pop().split("gp='")[1].split("'", 1)[0];
        AddAttribute("GP", MoneyGP, Character.id);
        var MoneyPP = StatBlock.match(/<money total='(.*?)>/g).pop().split("pp='")[1].split("'", 1)[0];
        AddAttribute("PP", MoneyPP, Character.id);
        var CurrentXP = StatBlock.match(/<xp total='(.*?)'/g).pop().split("='")[1].split("'", 1)[0];
        AddAttribute("experience", CurrentXP, Character.id);
        
        // Armor Class Values and Armor Penalties, Armor & Shield
        var ArmorBonus = StatBlock.match(/<armorclass (.*?)>/g).pop().split("fromarmor='")[1].split("'", 1)[0].replace("+", "");
        AddAttribute("armor-acbonus", ArmorBonus, Character.id);
        var ArmorShieldBonus = StatBlock.match(/<armorclass (.*?)>/g).pop().split("fromshield='")[1].split("'", 1)[0].replace("+", "");
        AddAttribute("shield-acbonus", ArmorShieldBonus, Character.id);
        var ArmorDodgeBonus = StatBlock.match(/<armorclass (.*?)>/g).pop().split("fromdodge='")[1].split("'", 1)[0].replace("+", "");
        AddAttribute("AC-dodge", ArmorDodgeBonus, Character.id);
        var ArmorNaturalBonus = StatBlock.match(/<armorclass (.*?)>/g).pop().split("fromnatural='")[1].split("'", 1)[0].replace("+", "");
        AddAttribute("AC-natural", ArmorNaturalBonus, Character.id);
        var ArmorDeflectBonus = StatBlock.match(/<armorclass (.*?)>/g).pop().split("fromdeflect='")[1].split("'", 1)[0].replace("+", "");
        AddAttribute("AC-deflect", ArmorDeflectBonus, Character.id);
        var ArmorMiscBonus = StatBlock.match(/<armorclass (.*?)>/g).pop().split("frommisc='")[1].split("'", 1)[0].replace("+", "");
        AddAttribute("AC-misc", ArmorMiscBonus, Character.id);
        
        
        // Armor Class Penalties are not broken down per item in Hero Labs, so can only add cumulative values to Armor Line
        var ArmorPenalty = StatBlock.match(/<penalty name='Armor Check Penalty'(.*?)>/g).pop().split("value='")[1].split("'", 1)[0];
        AddAttribute("armor-acp", ArmorPenalty, Character.id);
        var MaxDex = StatBlock.match(/<penalty name='Max Dex Bonus'(.*?)>/g).pop().split("value='")[1].split("'", 1)[0];
        AddAttribute("armor-max-dex", MaxDex, Character.id);
        if (StatBlock.match(/<arcanespellfailure (.*?)>/g) != null) {
            var ArcaneSpellFailure = StatBlock.match(/<arcanespellfailure (.*?)>/g).pop().split("value='")[1].split("'", 1)[0];
        } else {
            var ArcaneSpellFailure = "0";
        };
        AddAttribute("armor-spell-fail", ArcaneSpellFailure, Character.id);
        
        if (StatBlock.match(/<defenses>(.*?)<\/defenses>/g) != null) {
            if (StatBlock.match(/<armor name='(.*?)'/g) != null) {
                var Armor = StatBlock.match(/<armor (.*?)<\/armor>/g);
                var ArmorName = "None";
                var ArmorWeight = "0";
                var ShieldName = "None";
                var ShieldWeight = "0";
                for (var an = 0; an < Armor.length; an++) {
                    if (Armor[an].match(/<itemslot>(.*?)<\/itemslot>/g) != null) {
                        if (Armor[an].match(/<itemslot>(.*?)<\/itemslot>/g).pop().split("<itemslot>")[1].split("<\/itemslot>", 1)[0] === "Armor") {
                            if (Armor[an].indexOf("equipped='yes'") != -1) {
                                if (Armor[an].indexOf("natural='yes'") != -1){
                                    //do nothing as natural armor if figured in to AC elsewhere
                                } else {
                                    ArmorName = Armor[an].match(/<armor (.*?)<\/armor>/g).pop().split("name='")[1].split("'", 1)[0];
                                    ArmorWeight = Armor[an].match(/<weight (.*?)>/g).pop().split("value='")[1].split("'", 1)[0];
                                }
                            };
                        };
                    } else {
                        if (Armor[an].indexOf("equipped='yes'") != -1) {
                            ShieldName = Armor[an].match(/<armor (.*?)<\/armor>/g).pop().split("name='")[1].split("'", 1)[0];
                            ShieldWeight = Armor[an].match(/<weight (.*?)>/g).pop().split("value='")[1].split("'", 1)[0];
                        };
                    };
                // Add Armor and Shield's name and weight here.
                AddAttribute("armor", ArmorName, Character.id);
                AddAttribute("armor-weight", ArmorWeight, Character.id);
                AddAttribute("shield", ShieldName, Character.id);
                AddAttribute("shield-weight", ShieldWeight, Character.id);
                };        
            };
        };
        
        // It seems you can't rely on Initiative Miscellaneous bonus, as it seems that trait bonuses are not noted here even though they are applied on the sheet
        var InitiativeTotal = StatBlock.match(/<initiative (.*?)>/g).pop().split("total='")[1].split("'", 1)[0].replace("+", "");
        var InitiativeAttr = StatBlock.match(/<initiative (.*?)>/g).pop().split("attrtext='")[1].split("'", 1)[0].replace("+", "");
        var InitiativeBonus = parseInt(InitiativeTotal) + -parseInt(InitiativeAttr);
        AddAttribute("init-misc", InitiativeBonus, Character.id);
        
        // Other Statistics including Speed, SR, DR, Immunities
        var Speed = StatBlock.match(/<movement>(.*?)<\/movement>/g);
        var SpeedBase = "0";
        var SpeedBurrow = "0";
        var SpeedClimb = "0";
        var SpeedFly = "0";
        var SpeedFlyManeuverability = "";
        var SpeedSwim = "0";
        
        if (Speed[0].match(/<speed(.*?)>/g) != null) {
            SpeedBase = Speed[0].match(/<speed(.*?)>/g).pop().split("value='")[1].split("'", 1)[0];
            AddAttribute("speed-base", SpeedBase, Character.id);
        };
        if (Speed[0].match(/<special name='Burrowing (.*?)'/g) != null) {
            SpeedBurrow = Speed[0].match(/<special name='Burrowing (.*?)'/g).pop().split("(")[1].split(" feet)", 1)[0];
            AddAttribute("speed-misc", SpeedBurrow, Character.id);
        };
        if (Speed[0].match(/<special name='Climbing (.*?)'/g) != null) {        
            SpeedClimb = Speed[0].match(/<special name='Climbing (.*?)'/g).pop().split("(")[1].split(" feet)", 1)[0];
            AddAttribute("speed-climb", SpeedClimb, Character.id);
        };
        if (Speed[0].match(/<special name='Flight (.*?)'/g) != null) {        
            SpeedFly = Speed[0].match(/<special name='Flight (.*?)'/g).pop().split("(")[1].split(" feet,", 1)[0];
            SpeedFlyManeuverability = Speed[0].match(/ feet, (.*?)\)'/g).pop().split(", ")[1].split(")", 1)[0];
            AddAttribute("speed-fly", SpeedFly, Character.id);
            //AddAttribute("speed-fly-maneuverability", SpeedFlyManeuverability, Character.id);
        };
        if (Speed[0].match(/<special name='Swimming (.*?)'/g) != null) {        
            SpeedSwim = Speed[0].match(/<special name='Swimming (.*?)'/g).pop().split("(")[1].split(" feet)", 1)[0];
            AddAttribute("speed-swim", SpeedSwim, Character.id);
        };
        
        // Determine Spell and Energy Resistances
        SpellResistance = "";
        EnergyResistances = "";
        if (StatBlock.match(/<resistances\/>/g) != "<resistances\/>") {
            if (StatBlock.match(/<resistances>(.*?)<\/resistances>/g).pop().match(/name=(.*?)>/g) != null) {
                var ResistancesTemp = StatBlock.match(/<resistances>(.*?)<\/resistances>/g).pop().match(/name=(.*?)>/g);
                for (var sr = 0; sr < ResistancesTemp.length; sr++) {
                    if (ResistancesTemp[sr].match(/name='Spell Resistance (.*?)>/g) != null) {
                        var SpellResistance = ResistancesTemp[sr].match(/name='Spell Resistance (.*?)>/g).pop().split("(")[1].split(")", 1)[0];
                        AddAttribute("SR", SpellResistance, Character.id);
                    };
                };
                for (var er = ResistancesTemp.length; --er > -1;) {
                    if (ResistancesTemp[er].match(/name='Energy Resistance(.*?)>/g) != null) {
                        var EnergyResistances = ResistancesTemp[er].match(/name='Energy Resistance(.*?)>/g).pop().split("shortname='")[1].split("'", 1)[0] + ", " + EnergyResistances;
                        AddAttribute("resistances", EnergyResistances, Character.id);
                    };
                };
            };
        };
        
        // Determine Damage Reduction
        DamageReduction = "";
        if (StatBlock.match(/<damagereduction\/>/g) != "<damagereduction\/>") {
            if (StatBlock.match(/<damagereduction>(.*?)<\/damagereduction>/g).pop().match(/<special name=(.*?)>/g) != null) {
                var DamageReductionTemp = StatBlock.match(/<damagereduction>(.*?)<\/damagereduction>/g).pop().match(/<special name=(.*?)>/g);
                for (var dr = 0; dr < DamageReductionTemp.length; dr++) {
                    var DamageReduction = DamageReductionTemp[dr].match(/<special name=(.*?)>/g).pop().split("shortname='")[1].split("'", 1)[0] + ", " + DamageReduction;
                    AddAttribute("DR", DamageReduction, Character.id);
                };
            };
        };
        
        // Determine Immunities
        Immunities = "";
        if (StatBlock.match(/<immunities\/>/g) != "<immunities\/>") {
            if (StatBlock.match(/<immunities>(.*?)<\/immunities>/g).pop().match(/<special (.*?)>/g) != null) {
                var ImmunitiesTemp = StatBlock.match(/<immunities>(.*?)<\/immunities>/g).pop().match(/<special (.*?)>/g);
                for (var im = ImmunitiesTemp.length; --im > -1;) {
                    var Immunities = ImmunitiesTemp[im].match(/<special (.*?)>/g).pop().split("shortname='")[1].split("'", 1)[0] + ", " + Immunities;
                    AddAttribute("immunities", Immunities, Character.id);
                };
            };
        };
        
        // Determine Weaknesses
        Weaknesses = "";
        if (StatBlock.match(/<weaknesses\/>/g) != "<weaknesses\/>") {
            if (StatBlock.match(/<weaknesses>(.*?)<\/weaknesses>/g).pop().match(/<special (.*?)>/g) != null) {
                var WeaknessesTemp = StatBlock.match(/<weaknesses>(.*?)<\/weaknesses>/g).pop().match(/<special (.*?)>/g);
                for (var w = WeaknessesTemp.length; --w > -1;) {
                    var Weaknesses = WeaknessesTemp[w].match(/<special (.*?)>/g).pop().split("shortname='")[1].split("'", 1)[0] + ", " + Weaknesses;
                    AddAttribute("weaknesses", Weaknesses, Character.id);
                };
            };
        };
        
        
        // Throughout XML file special abilities are not sorted neatly by Race/Class/etc.. therefore will need to 
        // process the entire block of Special Abilities and try to sort them as logically as possible...
        // If the source is specified as class or racial, they will be added to the appropriate section.
        // However if the source is not specified look to see if the type is specified as Supernatural, Spell-Like, or 
        // Extraordinary and add them to the race trait (May not be proper in all cases...)
        var SpecialAbilities = StatBlock.match(/<special (.*?)<\/special>/g);
        
        // Need counter for Racial Traits and Class Abilities
        var rt = -1;
        var ca = -1;
        
        for (var sa = 0; sa < SpecialAbilities.length; sa++) {
            var SpecialName = "";
            var SpecialDescription = "";
            var SpecialSource = "";
            var SpecialName = SpecialAbilities[sa].split("name='")[1].split("'", 1)[0];
            if (SpecialAbilities[sa].indexOf("sourcetext='") >= 0) {
                var SpecialSource = SpecialAbilities[sa].split("sourcetext='")[1].split("'", 1)[0];
                if (RaceName.indexOf(SpecialSource) >= 0) {
                    RaceName = SpecialSource;  
                };
                if (SpecialSource.indexOf(RaceName) >= 0) {
                    var RepeatingRacialTraitName = "";
                    var RepeatingRacialTraitDescription = "";
                    var SpecialDescription = SpecialAbilities[sa].split("<description>")[1].split("<\/description>", 1)[0];
                    rt = (rt + 1);
                    var RepeatingRacialTraitName = "repeating_racial-trait_" + rt + "_name";
                    var RepeatingRacialTraitShortDescription = "repeating_racial-trait_" + rt + "_short-description";
                    var RepeatingRacialTraitDescription = "repeating_racial-trait_" + rt + "_description";
                    var RepeatingRacialTraitUsed = "repeating_racial-trait_" + rt + "_used";
                    var RepeatingRacialTraitMaxCalculation = "repeating_racial-trait_" + rt + "_max-calculation";
                    AddAttribute(RepeatingRacialTraitName, SpecialName, Character.id);
                    AddAttribute(RepeatingRacialTraitShortDescription, SpecialDescription, Character.id);
                    AddAttribute(RepeatingRacialTraitDescription, SpecialDescription, Character.id);
                    AddAttribute(RepeatingRacialTraitUsed, 0, Character.id);
                    AddAttribute(RepeatingRacialTraitMaxCalculation, 0, Character.id);
                };
                if (typeof Class0 !== 'undefined') {
                    if (Class0.indexOf(SpecialSource) >= 0) {
                        Class0 = SpecialSource;
                    };
                    if (SpecialSource.indexOf(Class0) >= 0) {
                        var RepeatingClassAbilityName  = "";
                        var RepeatingClassAbilityDescription = "";
                        var SpecialDescription = SpecialAbilities[sa].split("<description>")[1].split("<\/description>", 1)[0];
                        ca = (ca + 1);
                        var RepeatingClassAbilityClassNumber = "repeating_class-ability_" + ca + "_class-number";
                        var RepeatingClassAbilityName = "repeating_class-ability_" + ca + "_name";
                        var RepeatingClassAbilityShortDescription = "repeating_class-ability_" + ca + "_short-description";
                        var RepeatingClassAbilityDescription = "repeating_class-ability_" + ca + "_description";
                        var RepeatingClassAbilityUsed = "repeating_class-ability_" + ca + "_used";
                        var RepeatingClassAbilityMaxCalculation = "repeating_class-ability_" + ca + "_max-calculation";
                        AddAttribute(RepeatingClassAbilityClassNumber, "@{class-0-name}", Character.id);
                        AddAttribute(RepeatingClassAbilityName, SpecialName, Character.id);
                        AddAttribute(RepeatingClassAbilityShortDescription, SpecialDescription, Character.id);
                        AddAttribute(RepeatingClassAbilityDescription, SpecialDescription, Character.id);
                        AddAttribute(RepeatingClassAbilityUsed, 0, Character.id);
                        AddAttribute(RepeatingClassAbilityMaxCalculation, 0, Character.id);
                    };
                };
                if (typeof Class1 !== 'undefined') {
                    if (Class1.indexOf(SpecialSource) >= 0) {
                        Class1 = SpecialSource;
                    };
                    if (SpecialSource.indexOf(Class1) >= 0) {
                        var RepeatingClassAbilityName  = "";
                        var RepeatingClassAbilityDescription = "";
                        var SpecialDescription = SpecialAbilities[sa].split("<description>")[1].split("<\/description>", 1)[0];
                        ca = (ca + 1);
                        var RepeatingClassAbilityClassNumber = "repeating_class-ability_" + ca + "_class-number";
                        var RepeatingClassAbilityName = "repeating_class-ability_" + ca + "_name";
                        var RepeatingClassAbilityShortDescription = "repeating_class-ability_" + ca + "_short-description";
                        var RepeatingClassAbilityDescription = "repeating_class-ability_" + ca + "_description";
                        var RepeatingClassAbilityUsed = "repeating_class-ability_" + ca + "_used";
                        var RepeatingClassAbilityMaxCalculation = "repeating_class-ability_" + ca + "_max-calculation";
                        AddAttribute(RepeatingClassAbilityClassNumber, "@{class-1-name}", Character.id);
                        AddAttribute(RepeatingClassAbilityName, SpecialName, Character.id);
                        AddAttribute(RepeatingClassAbilityShortDescription, SpecialDescription, Character.id);
                        AddAttribute(RepeatingClassAbilityDescription, SpecialDescription, Character.id);
                        AddAttribute(RepeatingClassAbilityUsed, 0, Character.id);
                        AddAttribute(RepeatingClassAbilityMaxCalculation, 0, Character.id);
                    };
                };
                if (typeof Class2 !== 'undefined') {
                    if (Class2.indexOf(SpecialSource) >= 0) {
                        Class2 = SpecialSource;
                    };
                    if (SpecialSource.indexOf(Class2) >= 0) {
                        var RepeatingClassAbilityName  = "";
                        var RepeatingClassAbilityDescription = "";
                        var SpecialDescription = SpecialAbilities[sa].split("<description>")[1].split("<\/description>", 1)[0];
                        ca = (ca + 1);
                        var RepeatingClassAbilityClassNumber = "repeating_class-ability_" + ca + "_class-number";
                        var RepeatingClassAbilityName = "repeating_class-ability_" + ca + "_name";
                        var RepeatingClassAbilityShortDescription = "repeating_class-ability_" + ca + "_short-description";
                        var RepeatingClassAbilityDescription = "repeating_class-ability_" + ca + "_description";
                        var RepeatingClassAbilityUsed = "repeating_class-ability_" + ca + "_used";
                        var RepeatingClassAbilityMaxCalculation = "repeating_class-ability_" + ca + "_max-calculation";
                        AddAttribute(RepeatingClassAbilityClassNumber, "@{class-2-name}", Character.id);
                        AddAttribute(RepeatingClassAbilityName, SpecialName, Character.id);
                        AddAttribute(RepeatingClassAbilityShortDescription, SpecialDescription, Character.id);
                        AddAttribute(RepeatingClassAbilityDescription, SpecialDescription, Character.id);
                        AddAttribute(RepeatingClassAbilityUsed, 0, Character.id);
                        AddAttribute(RepeatingClassAbilityMaxCalculation, 0, Character.id);
                    };
                };
                if (typeof Class3 !== 'undefined') {
                    if (Class3.indexOf(SpecialSource) >= 0) {
                        Class3 = SpecialSource;
                    };
                    if (SpecialSource.indexOf(Class3) >= 0) {
                        var RepeatingClassAbilityName  = "";
                        var RepeatingClassAbilityDescription = "";
                        var SpecialDescription = SpecialAbilities[sa].split("<description>")[1].split("<\/description>", 1)[0];
                        ca = (ca + 1);
                        var RepeatingClassAbilityClassNumber = "repeating_class-ability_" + ca + "_class-number";
                        var RepeatingClassAbilityName = "repeating_class-ability_" + ca + "_name";
                        var RepeatingClassAbilityShortDescription = "repeating_class-ability_" + ca + "_short-description";
                        var RepeatingClassAbilityDescription = "repeating_class-ability_" + ca + "_description";
                        var RepeatingClassAbilityUsed = "repeating_class-ability_" + ca + "_used";
                        var RepeatingClassAbilityMaxCalculation = "repeating_class-ability_" + ca + "_max-calculation";
                        AddAttribute(RepeatingClassAbilityClassNumber, "@{class-3-name}", Character.id);
                        AddAttribute(RepeatingClassAbilityName, SpecialName, Character.id);
                        AddAttribute(RepeatingClassAbilityShortDescription, SpecialDescription, Character.id);
                        AddAttribute(RepeatingClassAbilityDescription, SpecialDescription, Character.id);
                        AddAttribute(RepeatingClassAbilityUsed, 0, Character.id);
                        AddAttribute(RepeatingClassAbilityMaxCalculation, 0, Character.id);
                    };
                };
                if (typeof Class4 !== 'undefined') {
                    if (Class4.indexOf(SpecialSource) >= 0) {
                        Class4 = SpecialSource;
                    };
                    if (SpecialSource.indexOf(Class4) >= 0) {
                        var RepeatingClassAbilityName  = "";
                        var RepeatingClassAbilityDescription = "";
                        var SpecialDescription = SpecialAbilities[sa].split("<description>")[1].split("<\/description>", 1)[0];
                        ca = (ca + 1);
                        var RepeatingClassAbilityClassNumber = "repeating_class-ability_" + ca + "_class-number";
                        var RepeatingClassAbilityName = "repeating_class-ability_" + ca + "_name";
                        var RepeatingClassAbilityShortDescription = "repeating_class-ability_" + ca + "_short-description";
                        var RepeatingClassAbilityDescription = "repeating_class-ability_" + ca + "_description";
                        var RepeatingClassAbilityUsed = "repeating_class-ability_" + ca + "_used";
                        var RepeatingClassAbilityMaxCalculation = "repeating_class-ability_" + ca + "_max-calculation";
                        AddAttribute(RepeatingClassAbilityClassNumber, "@{class-4-name}", Character.id);
                        AddAttribute(RepeatingClassAbilityName, SpecialName, Character.id);
                        AddAttribute(RepeatingClassAbilityShortDescription, SpecialDescription, Character.id);
                        AddAttribute(RepeatingClassAbilityDescription, SpecialDescription, Character.id);
                        AddAttribute(RepeatingClassAbilityUsed, 0, Character.id);
                        AddAttribute(RepeatingClassAbilityMaxCalculation, 0, Character.id);
                    };
                };
            } else if (SpecialAbilities[sa].indexOf("type='") >= 0) {
                var SpecialDescription = SpecialAbilities[sa].split("<description>")[1].split("<\/description>", 1)[0];
                var RepeatingRacialTraitName = "";
                var RepeatingRacialTraitDescription = "";
                var SpecialDescription = SpecialAbilities[sa].split("<description>")[1].split("<\/description>", 1)[0];
                rt = (rt + 1);
                var RepeatingRacialTraitName = "repeating_racial-trait_" + rt + "_name";
                var RepeatingRacialTraitShortDescription = "repeating_racial-trait_" + rt + "_short-description";
                var RepeatingRacialTraitDescription = "repeating_racial-trait_" + rt + "_description";
                var RepeatingRacialTraitUsed = "repeating_racial-trait_" + rt + "_used";
                var RepeatingRacialTraitMaxCalculation = "repeating_racial-trait_" + rt + "_max-calculation";
                AddAttribute(RepeatingRacialTraitName, SpecialName, Character.id);
                AddAttribute(RepeatingRacialTraitShortDescription, SpecialDescription, Character.id);
                AddAttribute(RepeatingRacialTraitDescription, SpecialDescription, Character.id);
                AddAttribute(RepeatingRacialTraitUsed, 0, Character.id);
                AddAttribute(RepeatingRacialTraitMaxCalculation, 0, Character.id);
                // Import here as a Racial Trait
            }; 
        };
        
        // Check <senses> for unclassified specials and set them to race trait
        if (StatBlock.match(/<senses>(.*?)<\/senses>/g) != null) {
            if (StatBlock.indexOf("<senses><\/senses>") == -1){
                var Senses = StatBlock.match(/<senses>(.*?)<\/senses>/g).pop().split("<special ");
                for (var sn = 0; sn < Senses.length; sn++) {
                    if (Senses[sn].indexOf("sourcetext='") >= 0) {
                        var SensesSource = Senses[sn].split("sourcetext='")[1].split("'", 1)[0];
                        if (SensesSource.indexOf(RaceName) < 0) {
                            var SensesName = Senses[sn].split("name='")[1].split("'", 1)[0];
                            var SensesDescription = Senses[sn].split("<description>")[1].split("<\/description", 1)[0];
                            var RepeatingRacialTraitName = "";
                            var RepeatingRacialTraitDescription = "";
                            //var SensesDescription = Senses[sn].split("<description>")[1].split("<\/description>", 1)[0];
                            rt = (rt + 1);
                            var RepeatingRacialTraitName = "repeating_racial-trait_" + rt + "_name";
                            var RepeatingRacialTraitShortDescription = "repeating_racial-trait_" + rt + "_short-description";
                            var RepeatingRacialTraitDescription = "repeating_racial-trait_" + rt + "_description";
                            var RepeatingRacialTraitUsed = "repeating_racial-trait_" + rt + "_used";
                            var RepeatingRacialTraitMaxCalculation = "repeating_racial-trait_" + rt + "_max-calculation";
                            AddAttribute(RepeatingRacialTraitName, SensesName, Character.id);
                            AddAttribute(RepeatingRacialTraitShortDescription, SensesDescription, Character.id);
                            AddAttribute(RepeatingRacialTraitDescription, SensesDescription, Character.id);
                            AddAttribute(RepeatingRacialTraitUsed, 0, Character.id);
                            AddAttribute(RepeatingRacialTraitMaxCalculation, 0, Character.id);
                        };
                    } else if (Senses[sn].indexOf("type='") >= 0) {
                        //ignore it again
                    } else {
                        if (Senses[sn].indexOf("name='") >= 0 ){
                            var SensesName = Senses[sn].split("name='")[1].split("'", 1)[0];
                            var SensesDescription = Senses[sn].split("<description>")[1].split("<\/description", 1)[0];
                            var RepeatingRacialTraitName = "";
                            var RepeatingRacialTraitDescription = "";
                            rt = (rt + 1);
                            var RepeatingRacialTraitName = "repeating_racial-trait_" + rt + "_name";
                            var RepeatingRacialTraitShortDescription = "repeating_racial-trait_" + rt + "_short-description";
                            var RepeatingRacialTraitDescription = "repeating_racial-trait_" + rt + "_description";
                            var RepeatingRacialTraitUsed = "repeating_racial-trait_" + rt + "_used";
                            var RepeatingRacialTraitMaxCalculation = "repeating_racial-trait_" + rt + "_max-calculation";
                            AddAttribute(RepeatingRacialTraitName, SensesName, Character.id);
                            AddAttribute(RepeatingRacialTraitShortDescription, SensesDescription, Character.id);
                            AddAttribute(RepeatingRacialTraitDescription, SensesDescription, Character.id);
                            AddAttribute(RepeatingRacialTraitUsed, 0, Character.id);
                            AddAttribute(RepeatingRacialTraitMaxCalculation, 0, Character.id);
                        };
                    };
                };
            };
        };
        
        // Check <spelllike> for unclassified specials and set them to race trait
        if (StatBlock.match(/<spelllike>(.*?)<\/spelllike>/g) != null) {
            if (StatBlock.indexOf("<spelllike><\/spelllike>") == -1) {
                var SpellLike = StatBlock.match(/<spelllike>(.*?)<\/spelllike>/g).pop().split("<special ");
                for (var sl = 0; sl < SpellLike.length; sl++) {
                    if (SpellLike[sl].indexOf("sourcetext='") >= 0) {
                        //do nothing
                    } else if (SpellLike[sl].indexOf("type='") >= 0) {
                        // do nothing again
                    } else {
                        if (SpellLike[sl].indexOf("name='") >= 0){
                            var SpellLikeName = SpellLike[sl].split("name='")[1].split("'", 1)[0];
                            var SpellLikeDescription = SpellLike[sl].split("<description>")[1].split("<\/description", 1)[0];
                            var RepeatingSpellLikeName = "";
                            var RepeatingSpellLikeDescription = "";
                            rt = (rt + 1);
                            var RepeatingSpellLikeName = "repeating_racial-trait_" + rt + "_name";
                            var RepeatingSpellLikeShortDescription = "repeating_racial-trait_" + rt + "_short-description";
                            var RepeatingSpellLikeDescription = "repeating_racial-trait_" + rt + "_description";
                            var RepeatingSpellLikeUsed = "repeating_racial-trait_" + rt + "_used";
                            var RepeatingSpellLikeMaxCalculation = "repeating_racial-trait_" + rt + "_max-calculation";
                            AddAttribute(RepeatingSpellLikeName, SpellLikeName, Character.id);
                            AddAttribute(RepeatingSpellLikeShortDescription, SpellLikeDescription, Character.id);
                            AddAttribute(RepeatingSpellLikeDescription, SpellLikeDescription, Character.id);
                            AddAttribute(RepeatingSpellLikeUsed, 0, Character.id);
                            AddAttribute(RepeatingSpellLikeMaxCalculation, 0, Character.id);
                        };
                    };
                };
            };
        };
        
        // Traits
        if (StatBlock.match(/<traits\/>/g) != "<traits\/>") {
            if (StatBlock.match(/<traits>(.*?)<\/traits>/g).pop().match(/<trait (.*?)<\/trait>/g) != null) {
                var Traits = StatBlock.match(/<traits>(.*?)<\/traits>/g).pop().match(/trait (.*?)<\/trait>/g);
                for (var tr = 0; tr < Traits.length; tr ++) {
                    var TraitsName = "";
                    var TraitsDescription = "";
                    TraitsName = Traits[tr].split("name='")[1].split("'", 1)[0];
                    TraitsDescription = Traits[tr].split("<description>")[1].split("<\/description>", 1)[0];
                    var RepeatingTraitsName = "";
                    var RepeatingTraitsDescription = "";
                    var RepeatingTraitsName = "repeating_trait_" + tr + "_name";
                    var RepeatingTraitsShortDescription = "repeating_trait_" + tr + "_short-description";
                    var RepeatingTraitsDescription = "repeating_trait_" + tr + "_description";
                    var RepeatingTraitsUsed = "repeating_trait_" + tr + "_used";
                    var RepeatingTraitsMaxCalculation = "repeating_trait_" + tr + "_max-calculation";
                    AddAttribute(RepeatingTraitsName, TraitsName, Character.id);
                    AddAttribute(RepeatingTraitsShortDescription, TraitsDescription, Character.id);
                    AddAttribute(RepeatingTraitsDescription, TraitsDescription, Character.id);
                    AddAttribute(RepeatingTraitsUsed, 0, Character.id);
                    AddAttribute(RepeatingTraitsMaxCalculation, 0, Character.id);
                };
            };
        };
        
        // Feats
        if (StatBlock.match(/<feats\/>/g) != "<feats\/>") {
            if (StatBlock.match(/<feats>(.*?)<\/feats>/g).pop().match(/<feat (.*?)<\/feat>/g) != null) {
                var Feats = StatBlock.match(/<feats>(.*?)<\/feats>/g).pop().match(/feat (.*?)<\/feat>/g);
                for (var fe = 0; fe < Feats.length; fe ++) {
                    var FeatsName = "";
                    var FeatsDescription = "";
                    FeatsName = Feats[fe].split("name='")[1].split("'", 1)[0];
                    FeatsDescription = Feats[fe].split("<description>")[1].split("<\/description>", 1)[0];
                    var RepeatingFeatsName = "";
                    var RepeatingFeatsDescription = "";
                    var RepeatingFeatsName = "repeating_feat_" + fe + "_name";
                    var RepeatingFeatsShortDescription = "repeating_feat_" + fe + "_short-description";
                    var RepeatingFeatsDescription = "repeating_feat_" + fe + "_description";
                    var RepeatingFeatsUsed = "repeating_feat_" + fe + "_used";
                    var RepeatingFeatsMaxCalculation = "repeating_feat_" + fe + "_max-calculation";
                    AddAttribute(RepeatingFeatsName, FeatsName, Character.id);
                    AddAttribute(RepeatingFeatsShortDescription, FeatsDescription, Character.id);
                    AddAttribute(RepeatingFeatsDescription, FeatsDescription, Character.id);
                    AddAttribute(RepeatingFeatsUsed, 0, Character.id);
                    AddAttribute(RepeatingFeatsMaxCalculation, 0, Character.id);
                };
            };
        };
        
        
        // Determine Worn Magic Items
        if (StatBlock.match(/<magicitems\/>/g) != "<magicitems\/>") {
            if (StatBlock.match(/<magicitems>(.*?)<\/magicitems>/g).pop().match(/<item (.*?)<\/item>/g) != null) {
                var MagicItems = StatBlock.match(/<magicitems>(.*?)<\/magicitems>/g).pop().match(/<item (.*?)<\/item>/g);
                // Ring Slot counter
                rc = 0;
                for (var mi = 0; mi < MagicItems.length; mi++) {
                    var MagicItemsName = "";
                    var MagicItemsDescription = "";
                    var MagicItemsQuantity = "";
                    var MagicItemsWeight = "";
                    var MagicItemsItemSlot = "";
                    MagicItemsName = MagicItems[mi].match(/<item (.*?)>/g).pop().split("name='")[1].split("'", 1)[0];
                    MagicItemsDescription = MagicItems[mi].match(/<description>(.*?)<\/description>/g).pop().split("<description>")[1].split("<\/description>", 1)[0];
                    MagicItemsQuantity = MagicItems[mi].match(/<item (.*?)>/g).pop().split("quantity='")[1].split("'", 1)[0];
                    MagicItemsWeight = MagicItems[mi].match(/<weight(.*?)>/g).pop().split("value='")[1].split("'", 1)[0];
                    if (MagicItems[mi].match(/<itemslot>(.*?)<\/itemslot>/g) != null) {
                        MagicItemsItemSlot = MagicItems[mi].match(/<itemslot>(.*?)<\/itemslot>/g).pop().split("<itemslot>")[1].split("<\/itemslot>", 1)[0];
                        if (MagicItemsItemSlot === "Belt") {
                            AddAttribute("worn-Belt", MagicItemsName, Character.id);
                            AddAttribute("worn-Belt-description", MagicItemsDescription, Character.id);
                        };
                        if (MagicItemsItemSlot === "Body") {
                            AddAttribute("worn-Body", MagicItemsName, Character.id);
                            AddAttribute("worn-Body-description", MagicItemsDescription, Character.id);
                        };
                        if (MagicItemsItemSlot === "Chest") {
                            AddAttribute("worn-Chest", MagicItemsName, Character.id);
                            AddAttribute("worn-Chest-description", MagicItemsDescription, Character.id);
                        };
                        if (MagicItemsItemSlot === "Eyes") {
                            AddAttribute("worn-Eyes", MagicItemsName, Character.id);
                            AddAttribute("worn-Eyes-description", MagicItemsDescription, Character.id);
                        };
                        if (MagicItemsItemSlot === "Feet") {
                            AddAttribute("worn-Feet", MagicItemsName, Character.id);
                            AddAttribute("worn-Feet-description", MagicItemsDescription, Character.id);
                        };
                        if (MagicItemsItemSlot === "Hands") {
                            AddAttribute("worn-Hands", MagicItemsName, Character.id);
                            AddAttribute("worn-Hands-description", MagicItemsDescription, Character.id);
                        };
                        if (MagicItemsItemSlot === "Head") {
                            AddAttribute("worn-Head", MagicItemsName, Character.id);
                            AddAttribute("worn-Head-description", MagicItemsDescription, Character.id);
                        };
                        if (MagicItemsItemSlot === "Headband") {
                            AddAttribute("worn-Headband", MagicItemsName, Character.id);
                            AddAttribute("worn-Headband-description", MagicItemsDescription, Character.id);
                        };
                        if (MagicItemsItemSlot === "Neck") {
                            AddAttribute("worn-Neck", MagicItemsName, Character.id);
                            AddAttribute("worn-Neck-description", MagicItemsDescription, Character.id);
                        };
                        if (MagicItemsItemSlot === "Ring") {
                            rc = (rc + 1);
                            if (rc === 1) {
                                var WornRing = "worn-Ring" + rc;
                                var WornRingDescription = "worn-Ring" + rc + "-description";
                                AddAttribute(WornRing, MagicItemsName, Character.id);
                                AddAttribute(WornRingDescription, MagicItemsDescription, Character.id);
                            } else if (rc === 2) {
                                var WornRing = "worn-Ring" + rc;
                                var WornRingDescription = "worn-Ring" + rc + "-description";
                                AddAttribute(WornRing, MagicItemsName, Character.id);
                                AddAttribute(WornRingDescription, MagicItemsDescription, Character.id);
                            };
                        };
                        if (MagicItemsItemSlot === "Shoulders") {
                            AddAttribute("worn-Shoulders", MagicItemsName, Character.id);
                            AddAttribute("worn-Shoulders-description", MagicItemsDescription, Character.id);
                        };
                        if (MagicItemsItemSlot === "Wrist") {
                            AddAttribute("worn-Wrist", MagicItemsName, Character.id);
                            AddAttribute("worn-Wrist-description", MagicItemsDescription, Character.id);
                        };
                    };
                    //Add Magic Items to Inventory
                    var RepeatingItemsName = "";
                    var RepeatingItemsDescription = "";
                    var RepeatingItemsName = "repeating_item_" + mi + "_name";
                    var RepeatingItemsShortDescription = "repeating_item_" + mi + "_short-description";
                    var RepeatingItemsDescription = "repeating_item_" + mi + "_description";
                    var RepeatingItemsWeight = "repeating_item_" + mi + "_weight";
                    AddAttribute(RepeatingItemsName, MagicItemsName, Character.id);
                    AddAttribute(RepeatingItemsShortDescription, MagicItemsDescription, Character.id);
                    AddAttribute(RepeatingItemsDescription, MagicItemsDescription, Character.id);
                    AddAttribute(RepeatingItemsWeight, MagicItemsWeight, Character.id);
                };
            // Save counter for adding general gear items to the end of the Magic Items in the Inventory section.
            var ii = mi;
            };
        };
        
        // Add non-magical inventory items
        if (StatBlock.match(/<gear\/>/g) != "<gear\/>") {
            if (StatBlock.match(/<gear>(.*?)<\/gear>/g).pop().match(/<item (.*?)<\/item>/g) != null) {
                var GearItems = StatBlock.match(/<gear>(.*?)<\/gear>/g).pop().match(/<item (.*?)<\/item>/g);
                for (var gi = 0; gi < GearItems.length; gi++) {
                    var GearItemsName = "";
                    var GearItemsDescription = "";
                    var GearItemsQuantity = "";
                    var GearItemsWeight = "";
                    var GearItemsName = GearItems[gi].match(/<item (.*?)>/g).pop().split("name='")[1].split("'", 1)[0];
                    var GearItemsDescription = GearItems[gi].match(/<description>(.*?)<\/description>/g).pop().split("<description>")[1].split("<\/description>", 1)[0];
                    var GearItemsQuantity = GearItems[gi].match(/<item (.*?)>/g).pop().split("quantity='")[1].split("'", 1)[0];
                    var GearItemsWeight = GearItems[gi].match(/<weight (.*?)>/g).pop().split("value='")[1].split("'", 1)[0];
                    var RepeatingItemsName = "";
                    var RepeatingItemsDescription = "";
                    var RepeatingItemsName = "repeating_item_" + ii + "_name";
                    var RepeatingItemsShortDescription = "repeating_item_" + ii + "_short-description";
                    var RepeatingItemsQuantity = "repeating_item_" + ii + "_qty";
                    var RepeatingItemsDescription = "repeating_item_" + ii + "_description";
                    var RepeatingItemsWeight = "repeating_item_" + ii + "_weight";
                    AddAttribute(RepeatingItemsName, GearItemsName, Character.id);
                    AddAttribute(RepeatingItemsShortDescription, GearItemsDescription, Character.id);
                    AddAttribute(RepeatingItemsDescription, GearItemsDescription, Character.id);
                    AddAttribute(RepeatingItemsQuantity, GearItemsQuantity, Character.id);
                    AddAttribute(RepeatingItemsWeight, GearItemsWeight, Character.id);
                    ii = (ii + 1);
                };
            };
        };
        
        // Determine skills, trait bonuses and uncommon bonuses (i.e. Bard Versatile Performance) are not easily 
        // handled, so did my best to ensure that the total value should be set correct.  In these cases, the bonuses
        // have to be listed as misc, because the xml doesn't classify (or report) all bonuses.
        
        if (StatBlock.match(/<skills\/>/g) != "<skills\/>") {
            if (StatBlock.match(/<skills>(.*?)<\/skills>/g).pop().match(/<skill (.*?)<\/skill>/g) != null) {
                var Skills = StatBlock.match(/<skills>(.*?)<\/skills>/g).pop().match(/<skill (.*?)<\/skill>/g);
                // Craft, Perform, Profession counters
                var cra = 0;
                var per = 0;
                var pro = 0;
                for (var sk = 0; sk < Skills.length; sk++) {
                    var SkillsName = "";
                    var SkillsNameRanks = "";
                    var SkillsNameMisc = "";
                    var SkillsValue = "";
                    var SkillsAttrBonus = "";
                    var SkillsRanks = "";
                    var SkillsClassSkill = "";
                    var SkillsMiscBonus = "";
                    SkillsName = Skills[sk].match(/<skill (.*?)>/g).pop().split("name='")[1].split("'", 1)[0];
                    SkillsValue = Skills[sk].match(/<skill (.*?)>/g).pop().split("value='")[1].split("'", 1)[0];
                    SkillsAttrBonus = Skills[sk].match(/<skill (.*?)>/g).pop().split("attrbonus='")[1].split("'", 1)[0];
                    SkillsRanks = Skills[sk].match(/<skill (.*?)>/g).pop().split("ranks='")[1].split("'", 1)[0];
                    if (Skills[sk].indexOf("classskill=") >= 0) {
                        SkillsClassSkill = Skills[sk].match(/<skill (.*?)>/g).pop().split("classskill='")[1].split("'", 1)[0];
                        // Calculate misc. bonus
                        if (Skills[sk].indexOf("armorcheck=") >= 0){
                            if (parseInt(SkillsValue) + -parseInt(SkillsAttrBonus) + -parseInt(SkillsRanks) + -parseInt(ArmorPenalty) == 0) {
                                SkillsMiscBonus = 0
                            } else {
                                SkillsMiscBonus = parseInt(SkillsValue) + -parseInt(SkillsAttrBonus) + -parseInt(SkillsRanks) + -parseInt(ArmorPenalty) + -3;
                            };
                        } else if (parseInt(SkillsValue) + -parseInt(SkillsAttrBonus) + -parseInt(SkillsRanks) == 0) {
                            SkillsMiscBonus = 0
                        } else {
                            SkillsMiscBonus = parseInt(SkillsValue) + -parseInt(SkillsAttrBonus) + -parseInt(SkillsRanks) + -3;
                        };
                    } else {
                        if (Skills[sk].indexOf("armorcheck=") >= 0){
                            SkillsMiscBonus = parseInt(SkillsValue) + -parseInt(SkillsAttrBonus) + -parseInt(SkillsRanks) + -parseInt(ArmorPenalty);
                        } else {
                            SkillsMiscBonus = parseInt(SkillsValue) + -parseInt(SkillsAttrBonus) + -parseInt(SkillsRanks);
                        };
                    };
                    //log(SkillsName);
                    // Cleanup SkillsName to match what the sheet expects.
                    SkillsName = SkillsName.replace(/\s/g, "-");
                    SkillsName = SkillsName.replace("(", "");
                    SkillsName = SkillsName.replace(")", "");
                    SkillsName = SkillsName.replace("arcana", "Arcana");
                    SkillsName = SkillsName.replace("dungeoneering", "Dungeoneering");
                    SkillsName = SkillsName.replace("engineering", "Engineering");
                    SkillsName = SkillsName.replace("geography", "Geography");
                    SkillsName = SkillsName.replace("history", "History");
                    SkillsName = SkillsName.replace("local", "Local");
                    SkillsName = SkillsName.replace("nature", "Nature");
                    SkillsName = SkillsName.replace("nobility", "Nobility");
                    SkillsName = SkillsName.replace("planes", "Planes");
                    SkillsName = SkillsName.replace("religion", "Religion");
                    // Build field name for ranks and misc bonus
                    SkillsNameRanks = SkillsName.concat("-ranks");
                    SkillsNameMisc = SkillsName.concat("-misc");
                    SkillsClassSkillName = SkillsName.concat("-cs");
                    SkillsClassSkillValue = "((((3 * @{" + SkillsNameRanks + "}) + 3) - abs((3 * @{" + SkillsNameRanks + "}) - 3)) / 2)";
                    
                    if (SkillsName.indexOf("Perform") >= 0){
                        SkillsNameArray = SkillsName.split("-");
                        SkillsName = SkillsNameArray[0];
                        SkillsNamePerformNameValue = SkillsNameArray[1];
                        if (per === 0) {
                            SkillsName = "Perform-ranks";
                            SkillsNamePerformName = "Perform-name";
                            SkillsNameMisc = "Perform-misc";
                            SkillsClassSkillName = "Perform-cs";
                            SkillsClassSkillValue = "((((3 * @{" + SkillsName + "}) + 3) - abs((3 * @{" + SkillsName + "}) - 3)) / 2)";
                        } else if (per === 1) {
                            SkillsName = "Perform2-ranks";
                            SkillsNamePerformName = "Perform2-name";
                            SkillsNameMisc = "Perform2-misc";
                            SkillsClassSkillName = "Perform2-cs";
                            SkillsClassSkillValue = "((((3 * @{" + SkillsName + "}) + 3) - abs((3 * @{" + SkillsName + "}) - 3)) / 2)";
                        } else if (per === 2) {
                            SkillsName = "Perform3-ranks";
                            SkillsNamePerformName = "Perform3-name";
                            SkillsNameMisc = "Perform3-misc";
                            SkillsClassSkillName = "Perform3-cs";
                            SkillsClassSkillValue = "((((3 * @{" + SkillsName + "}) + 3) - abs((3 * @{" + SkillsName + "}) - 3)) / 2)";
                        };
                        AddAttribute(SkillsNamePerformName, SkillsNamePerformNameValue, Character.id);
                        AddAttribute(SkillsName, SkillsRanks, Character.id);
                        AddAttribute(SkillsNameMisc, SkillsMiscBonus, Character.id);
                        if (SkillsClassSkill === "yes") {
                            AddAttribute(SkillsClassSkillName, SkillsClassSkillValue, Character.id);
                        };
                    per = (per + 1);
                    } else if (SkillsName.indexOf("Craft") >= 0) {
                        SkillsNameArray = SkillsName.split("-");
                        SkillsName = SkillsNameArray[0];
                        SkillsNamePerformNameValue = SkillsNameArray[1];
                        if (cra === 0) {
                            SkillsName = "Craft-ranks";
                            SkillsNamePerformName = "Craft-name";
                            SkillsNameMisc = "Craft-misc";
                            SkillsClassSkillName = "Craft-cs";
                            SkillsClassSkillValue = "((((3 * @{" + SkillsName + "}) + 3) - abs((3 * @{" + SkillsName + "}) - 3)) / 2)";
                        } else if (cra === 1) {
                            SkillsName = "Craft2-ranks";
                            SkillsNamePerformName = "Craft2-name";
                            SkillsNameMisc = "Craft2-misc";
                            SkillsClassSkillName = "Craft2-cs";
                            SkillsClassSkillValue = "((((3 * @{" + SkillsName + "}) + 3) - abs((3 * @{" + SkillsName + "}) - 3)) / 2)";
                        } else if (cra === 2) {
                            SkillsName = "Craft3-ranks";
                            SkillsNamePerformName = "Craft3-name";
                            SkillsNameMisc = "Craft3-misc";
                            SkillsClassSkillName = "Craft3-cs";
                            SkillsClassSkillValue = "((((3 * @{" + SkillsName + "}) + 3) - abs((3 * @{" + SkillsName + "}) - 3)) / 2)";
                        };
                        AddAttribute(SkillsNamePerformName, SkillsNamePerformNameValue, Character.id);
                        AddAttribute(SkillsName, SkillsRanks, Character.id);
                        AddAttribute(SkillsNameMisc, SkillsMiscBonus, Character.id);
                        if (SkillsClassSkill === "yes") {
                            AddAttribute(SkillsClassSkillName, SkillsClassSkillValue, Character.id);
                        };
                    cra = (cra + 1);
                    } else if (SkillsName.indexOf("Profession") >= 0) {
                        SkillsNameArray = SkillsName.split("-");
                        SkillsName = SkillsNameArray[0];
                        SkillsNamePerformNameValue = SkillsNameArray[1];
                        if (pro === 0) {
                            SkillsName = "Profession-ranks";
                            SkillsNamePerformName = "Profession-name";
                            SkillsNameMisc = "Profession-misc";
                            SkillsClassSkillName = "Profession-cs";
                            SkillsClassSkillValue = "((((3 * @{" + SkillsName + "}) + 3) - abs((3 * @{" + SkillsName + "}) - 3)) / 2)";
                        } else if (pro === 1) {
                            SkillsName = "Profession2-ranks";
                            SkillsNamePerformName = "Profession2-name";
                            SkillsNameMisc = "Profession2-misc";
                            SkillsClassSkillName = "Profession2-cs";
                            SkillsClassSkillValue = "((((3 * @{" + SkillsName + "}) + 3) - abs((3 * @{" + SkillsName + "}) - 3)) / 2)";
                        } else if (pro === 2) {
                            SkillsName = "Profession3-ranks";
                            SkillsNamePerformName = "Profession3-name";
                            SkillsNameMisc = "Profession3-misc";
                            SkillsClassSkillName = "Profession3-cs";
                            SkillsClassSkillValue = "((((3 * @{" + SkillsName + "}) + 3) - abs((3 * @{" + SkillsName + "}) - 3)) / 2)";
                        };
                        AddAttribute(SkillsNamePerformName, SkillsNamePerformNameValue, Character.id);
                        AddAttribute(SkillsName, SkillsRanks, Character.id);
                        AddAttribute(SkillsNameMisc, SkillsMiscBonus, Character.id);
                        if (SkillsClassSkill === "yes") {
                            AddAttribute(SkillsClassSkillName, SkillsClassSkillValue, Character.id);
                        };
                    pro = (pro + 1);
                    } else {
                        AddAttribute(SkillsNameRanks, SkillsRanks, Character.id);
                        AddAttribute(SkillsNameMisc, SkillsMiscBonus, Character.id);
                        if (SkillsClassSkill === "yes") {
                            AddAttribute(SkillsClassSkillName, SkillsClassSkillValue, Character.id);
                        };
                    };
                };
            };
        };
        
        // Spells
        if (StatBlock.match(/<spell\/>/g) != "<spell\/>") {
            if (StatBlock.match(/<spell (.*?)<\/spell>/g).pop().match(/<spell (.*?)<\/spell>/g) != null) {
                var SpellBlock = StatBlock.match(/<spell (.*?)<\/spell>/g);
                // spell level counter array
                var slc = [0,0,0,0,0,0,0,0,0,0]
                for (var sb = 0; sb < SpellBlock.length; sb++) {
                    var SpellLevel = "";
                    var SpelllName = "";
                    var SpellSchool = "";
                    var SpellCastTime = "";
                    var SpellComponents = "";
                    var SpellRange = "";
                    var SpellTargets = "";
                    var SpellDuration = "";
                    var SpellSave = "";
                    var SpellSR = "";
                    var SpelllDescription = "";
                    SpellLevel = SpellBlock[sb].split("level='")[1].split("'", 1)[0];
                    SpellName = SpellBlock[sb].split("name='")[1].split("'", 1)[0];
                    SpellSchool = SpellBlock[sb].split("schooltext='")[1].split("'", 1)[0];
                    SpellCastTime = SpellBlock[sb].split("casttime='")[1].split("'", 1)[0];
                    SpellComponents = SpellBlock[sb].split("componenttext='")[1].split("'", 1)[0];
                    SpellRange = SpellBlock[sb].split("range='")[1].split("'", 1)[0];
                    SpellTargets = SpellBlock[sb].split("target='")[1].split("'", 1)[0];
                    SpellDuration = SpellBlock[sb].split("duration='")[1].split("'", 1)[0];
                    SpellSave = SpellBlock[sb].split("save='")[1].split("'", 1)[0];
                    SpellSR = SpellBlock[sb].split("resist='")[1].split("'", 1)[0];
                    if (SpellSR.indexOf("Yes") >= 0){
                        SpellSR = "Spell Resistance: Yes";
                    } else {
                        SpellSR = "Spell Resistance: No";
                    };
                    SpellDescription = SpellBlock[sb].split("<description>")[1].split("<\/description>", 1)[0];
                    //repeating field entries
                    var RepeatingSpellLevel = "";
                    var RepeatingSpellName = "";
                    var RepeatingSpellSchool = "";
                    var RepeatingSpellCastTime = "";
                    var RepeatingSpellComponents = "";
                    var RepeatingSpellRange = "";
                    var RepeatingSpellTargets = "";
                    var RepeatingSpellDuration = "";
                    var RepeatingSpellSave = "";
                    var RepeatingSpellSR = "";
                    var RepeatingSpellDescription = "";
                    
                    if (SpellBlock[sb].indexOf(" level='0'") >= 0) {
                        RepeatingSpellName = "repeating_lvl-" + SpellLevel + "-spells_" + slc[0] + "_name";
                        RepeatingSpellSchool = "repeating_lvl-" + SpellLevel + "-spells_" + slc[0] + "_school";
                        RepeatingSpellCastTime = "repeating_lvl-" + SpellLevel + "-spells_" + slc[0] + "_cast-time";
                        RepeatingSpellComponents = "repeating_lvl-" + SpellLevel + "-spells_" + slc[0] + "_components";
                        RepeatingSpellRange = "repeating_lvl-" + SpellLevel + "-spells_" + slc[0] + "_range";
                        RepeatingSpellTargets = "repeating_lvl-" + SpellLevel + "-spells_" + slc[0] + "_targets";
                        RepeatingSpellDuration = "repeating_lvl-" + SpellLevel + "-spells_" + slc[0] + "_duration";
                        RepeatingSpellSave = "repeating_lvl-" + SpellLevel + "-spells_" + slc[0] + "_save";
                        RepeatingSpellSR = "repeating_lvl-" + SpellLevel + "-spells_" + slc[0] + "_SR";
                        RepeatingSpellDescription = "repeating_lvl-" + SpellLevel + "-spells_" + slc[0] + "_description";
                        AddAttribute(RepeatingSpellName, SpellName, Character.id);
                        AddAttribute(RepeatingSpellSchool, SpellSchool, Character.id);
                        AddAttribute(RepeatingSpellCastTime, SpellCastTime, Character.id);
                        AddAttribute(RepeatingSpellComponents, SpellComponents, Character.id);
                        AddAttribute(RepeatingSpellRange, SpellRange, Character.id);
                        AddAttribute(RepeatingSpellTargets, SpellTargets, Character.id);
                        AddAttribute(RepeatingSpellDuration, SpellDuration, Character.id);
                        AddAttribute(RepeatingSpellSave, SpellSave, Character.id);
                        AddAttribute(RepeatingSpellSR, SpellSR, Character.id);
                        AddAttribute(RepeatingSpellDescription, SpellDescription, Character.id);
                        slc[0]++;
                    };
                    if (SpellBlock[sb].indexOf(" level='1'") >= 0) {
                        RepeatingSpellName = "repeating_lvl-" + SpellLevel + "-spells_" + slc[1] + "_name";
                        RepeatingSpellSchool = "repeating_lvl-" + SpellLevel + "-spells_" + slc[1] + "_school";
                        RepeatingSpellCastTime = "repeating_lvl-" + SpellLevel + "-spells_" + slc[1] + "_cast-time";
                        RepeatingSpellComponents = "repeating_lvl-" + SpellLevel + "-spells_" + slc[1] + "_components";
                        RepeatingSpellRange = "repeating_lvl-" + SpellLevel + "-spells_" + slc[1] + "_range";
                        RepeatingSpellTargets = "repeating_lvl-" + SpellLevel + "-spells_" + slc[1] + "_targets";
                        RepeatingSpellDuration = "repeating_lvl-" + SpellLevel + "-spells_" + slc[1] + "_duration";
                        RepeatingSpellSave = "repeating_lvl-" + SpellLevel + "-spells_" + slc[1] + "_save";
                        RepeatingSpellSR = "repeating_lvl-" + SpellLevel + "-spells_" + slc[1] + "_SR";
                        RepeatingSpellDescription = "repeating_lvl-" + SpellLevel + "-spells_" + slc[1] + "_description";
                        AddAttribute(RepeatingSpellName, SpellName, Character.id);
                        AddAttribute(RepeatingSpellSchool, SpellSchool, Character.id);
                        AddAttribute(RepeatingSpellCastTime, SpellCastTime, Character.id);
                        AddAttribute(RepeatingSpellComponents, SpellComponents, Character.id);
                        AddAttribute(RepeatingSpellRange, SpellRange, Character.id);
                        AddAttribute(RepeatingSpellTargets, SpellTargets, Character.id);
                        AddAttribute(RepeatingSpellDuration, SpellDuration, Character.id);
                        AddAttribute(RepeatingSpellSave, SpellSave, Character.id);
                        AddAttribute(RepeatingSpellSR, SpellSR, Character.id);
                        AddAttribute(RepeatingSpellDescription, SpellDescription, Character.id);
                        slc[1]++;
                    };
                    if (SpellBlock[sb].indexOf(" level='2'") >= 0) {
                        RepeatingSpellName = "repeating_lvl-" + SpellLevel + "-spells_" + slc[2] + "_name";
                        RepeatingSpellSchool = "repeating_lvl-" + SpellLevel + "-spells_" + slc[2] + "_school";
                        RepeatingSpellCastTime = "repeating_lvl-" + SpellLevel + "-spells_" + slc[2] + "_cast-time";
                        RepeatingSpellComponents = "repeating_lvl-" + SpellLevel + "-spells_" + slc[2] + "_components";
                        RepeatingSpellRange = "repeating_lvl-" + SpellLevel + "-spells_" + slc[2] + "_range";
                        RepeatingSpellTargets = "repeating_lvl-" + SpellLevel + "-spells_" + slc[2] + "_targets";
                        RepeatingSpellDuration = "repeating_lvl-" + SpellLevel + "-spells_" + slc[2] + "_duration";
                        RepeatingSpellSave = "repeating_lvl-" + SpellLevel + "-spells_" + slc[2] + "_save";
                        RepeatingSpellSR = "repeating_lvl-" + SpellLevel + "-spells_" + slc[2] + "_SR";
                        RepeatingSpellDescription = "repeating_lvl-" + SpellLevel + "-spells_" + slc[2] + "_description";
                        AddAttribute(RepeatingSpellName, SpellName, Character.id);
                        AddAttribute(RepeatingSpellSchool, SpellSchool, Character.id);
                        AddAttribute(RepeatingSpellCastTime, SpellCastTime, Character.id);
                        AddAttribute(RepeatingSpellComponents, SpellComponents, Character.id);
                        AddAttribute(RepeatingSpellRange, SpellRange, Character.id);
                        AddAttribute(RepeatingSpellTargets, SpellTargets, Character.id);
                        AddAttribute(RepeatingSpellDuration, SpellDuration, Character.id);
                        AddAttribute(RepeatingSpellSave, SpellSave, Character.id);
                        AddAttribute(RepeatingSpellSR, SpellSR, Character.id);
                        AddAttribute(RepeatingSpellDescription, SpellDescription, Character.id);
                        slc[2]++;
                    };
                    if (SpellBlock[sb].indexOf(" level='3'") >= 0) {
                        RepeatingSpellName = "repeating_lvl-" + SpellLevel + "-spells_" + slc[3] + "_name";
                        RepeatingSpellSchool = "repeating_lvl-" + SpellLevel + "-spells_" + slc[3] + "_school";
                        RepeatingSpellCastTime = "repeating_lvl-" + SpellLevel + "-spells_" + slc[3] + "_cast-time";
                        RepeatingSpellComponents = "repeating_lvl-" + SpellLevel + "-spells_" + slc[3] + "_components";
                        RepeatingSpellRange = "repeating_lvl-" + SpellLevel + "-spells_" + slc[3] + "_range";
                        RepeatingSpellTargets = "repeating_lvl-" + SpellLevel + "-spells_" + slc[3] + "_targets";
                        RepeatingSpellDuration = "repeating_lvl-" + SpellLevel + "-spells_" + slc[3] + "_duration";
                        RepeatingSpellSave = "repeating_lvl-" + SpellLevel + "-spells_" + slc[3] + "_save";
                        RepeatingSpellSR = "repeating_lvl-" + SpellLevel + "-spells_" + slc[3] + "_SR";
                        RepeatingSpellDescription = "repeating_lvl-" + SpellLevel + "-spells_" + slc[3] + "_description";
                        AddAttribute(RepeatingSpellName, SpellName, Character.id);
                        AddAttribute(RepeatingSpellSchool, SpellSchool, Character.id);
                        AddAttribute(RepeatingSpellCastTime, SpellCastTime, Character.id);
                        AddAttribute(RepeatingSpellComponents, SpellComponents, Character.id);
                        AddAttribute(RepeatingSpellRange, SpellRange, Character.id);
                        AddAttribute(RepeatingSpellTargets, SpellTargets, Character.id);
                        AddAttribute(RepeatingSpellDuration, SpellDuration, Character.id);
                        AddAttribute(RepeatingSpellSave, SpellSave, Character.id);
                        AddAttribute(RepeatingSpellSR, SpellSR, Character.id);
                        AddAttribute(RepeatingSpellDescription, SpellDescription, Character.id);
                        slc[3]++;
                    };
                    if (SpellBlock[sb].indexOf(" level='4'") >= 0) {
                        RepeatingSpellName = "repeating_lvl-" + SpellLevel + "-spells_" + slc[4] + "_name";
                        RepeatingSpellSchool = "repeating_lvl-" + SpellLevel + "-spells_" + slc[4] + "_school";
                        RepeatingSpellCastTime = "repeating_lvl-" + SpellLevel + "-spells_" + slc[4] + "_cast-time";
                        RepeatingSpellComponents = "repeating_lvl-" + SpellLevel + "-spells_" + slc[4] + "_components";
                        RepeatingSpellRange = "repeating_lvl-" + SpellLevel + "-spells_" + slc[4] + "_range";
                        RepeatingSpellTargets = "repeating_lvl-" + SpellLevel + "-spells_" + slc[4] + "_targets";
                        RepeatingSpellDuration = "repeating_lvl-" + SpellLevel + "-spells_" + slc[4] + "_duration";
                        RepeatingSpellSave = "repeating_lvl-" + SpellLevel + "-spells_" + slc[4] + "_save";
                        RepeatingSpellSR = "repeating_lvl-" + SpellLevel + "-spells_" + slc[4] + "_SR";
                        RepeatingSpellDescription = "repeating_lvl-" + SpellLevel + "-spells_" + slc[4] + "_description";
                        AddAttribute(RepeatingSpellName, SpellName, Character.id);
                        AddAttribute(RepeatingSpellSchool, SpellSchool, Character.id);
                        AddAttribute(RepeatingSpellCastTime, SpellCastTime, Character.id);
                        AddAttribute(RepeatingSpellComponents, SpellComponents, Character.id);
                        AddAttribute(RepeatingSpellRange, SpellRange, Character.id);
                        AddAttribute(RepeatingSpellTargets, SpellTargets, Character.id);
                        AddAttribute(RepeatingSpellDuration, SpellDuration, Character.id);
                        AddAttribute(RepeatingSpellSave, SpellSave, Character.id);
                        AddAttribute(RepeatingSpellSR, SpellSR, Character.id);
                        AddAttribute(RepeatingSpellDescription, SpellDescription, Character.id);
                        slc[4]++;
                    };
                    if (SpellBlock[sb].indexOf(" level='5'") >= 0) {
                        RepeatingSpellName = "repeating_lvl-" + SpellLevel + "-spells_" + slc[5] + "_name";
                        RepeatingSpellSchool = "repeating_lvl-" + SpellLevel + "-spells_" + slc[5] + "_school";
                        RepeatingSpellCastTime = "repeating_lvl-" + SpellLevel + "-spells_" + slc[5] + "_cast-time";
                        RepeatingSpellComponents = "repeating_lvl-" + SpellLevel + "-spells_" + slc[5] + "_components";
                        RepeatingSpellRange = "repeating_lvl-" + SpellLevel + "-spells_" + slc[5] + "_range";
                        RepeatingSpellTargets = "repeating_lvl-" + SpellLevel + "-spells_" + slc[5] + "_targets";
                        RepeatingSpellDuration = "repeating_lvl-" + SpellLevel + "-spells_" + slc[5] + "_duration";
                        RepeatingSpellSave = "repeating_lvl-" + SpellLevel + "-spells_" + slc[5] + "_save";
                        RepeatingSpellSR = "repeating_lvl-" + SpellLevel + "-spells_" + slc[5] + "_SR";
                        RepeatingSpellDescription = "repeating_lvl-" + SpellLevel + "-spells_" + slc[5] + "_description";
                        AddAttribute(RepeatingSpellName, SpellName, Character.id);
                        AddAttribute(RepeatingSpellSchool, SpellSchool, Character.id);
                        AddAttribute(RepeatingSpellCastTime, SpellCastTime, Character.id);
                        AddAttribute(RepeatingSpellComponents, SpellComponents, Character.id);
                        AddAttribute(RepeatingSpellRange, SpellRange, Character.id);
                        AddAttribute(RepeatingSpellTargets, SpellTargets, Character.id);
                        AddAttribute(RepeatingSpellDuration, SpellDuration, Character.id);
                        AddAttribute(RepeatingSpellSave, SpellSave, Character.id);
                        AddAttribute(RepeatingSpellSR, SpellSR, Character.id);
                        AddAttribute(RepeatingSpellDescription, SpellDescription, Character.id);
                        slc[5]++;
                    };
                    if (SpellBlock[sb].indexOf(" level='6'") >= 0) {
                        RepeatingSpellName = "repeating_lvl-" + SpellLevel + "-spells_" + slc[6] + "_name";
                        RepeatingSpellSchool = "repeating_lvl-" + SpellLevel + "-spells_" + slc[6] + "_school";
                        RepeatingSpellCastTime = "repeating_lvl-" + SpellLevel + "-spells_" + slc[6] + "_cast-time";
                        RepeatingSpellComponents = "repeating_lvl-" + SpellLevel + "-spells_" + slc[6] + "_components";
                        RepeatingSpellRange = "repeating_lvl-" + SpellLevel + "-spells_" + slc[6] + "_range";
                        RepeatingSpellTargets = "repeating_lvl-" + SpellLevel + "-spells_" + slc[6] + "_targets";
                        RepeatingSpellDuration = "repeating_lvl-" + SpellLevel + "-spells_" + slc[6] + "_duration";
                        RepeatingSpellSave = "repeating_lvl-" + SpellLevel + "-spells_" + slc[6] + "_save";
                        RepeatingSpellSR = "repeating_lvl-" + SpellLevel + "-spells_" + slc[6] + "_SR";
                        RepeatingSpellDescription = "repeating_lvl-" + SpellLevel + "-spells_" + slc[6] + "_description";
                        AddAttribute(RepeatingSpellName, SpellName, Character.id);
                        AddAttribute(RepeatingSpellSchool, SpellSchool, Character.id);
                        AddAttribute(RepeatingSpellCastTime, SpellCastTime, Character.id);
                        AddAttribute(RepeatingSpellComponents, SpellComponents, Character.id);
                        AddAttribute(RepeatingSpellRange, SpellRange, Character.id);
                        AddAttribute(RepeatingSpellTargets, SpellTargets, Character.id);
                        AddAttribute(RepeatingSpellDuration, SpellDuration, Character.id);
                        AddAttribute(RepeatingSpellSave, SpellSave, Character.id);
                        AddAttribute(RepeatingSpellSR, SpellSR, Character.id);
                        AddAttribute(RepeatingSpellDescription, SpellDescription, Character.id);
                        slc[6]++;
                    };
                    if (SpellBlock[sb].indexOf(" level='7'") >= 0) {
                        RepeatingSpellName = "repeating_lvl-" + SpellLevel + "-spells_" + slc[7] + "_name";
                        RepeatingSpellSchool = "repeating_lvl-" + SpellLevel + "-spells_" + slc[7] + "_school";
                        RepeatingSpellCastTime = "repeating_lvl-" + SpellLevel + "-spells_" + slc[7] + "_cast-time";
                        RepeatingSpellComponents = "repeating_lvl-" + SpellLevel + "-spells_" + slc[7] + "_components";
                        RepeatingSpellRange = "repeating_lvl-" + SpellLevel + "-spells_" + slc[7] + "_range";
                        RepeatingSpellTargets = "repeating_lvl-" + SpellLevel + "-spells_" + slc[7] + "_targets";
                        RepeatingSpellDuration = "repeating_lvl-" + SpellLevel + "-spells_" + slc[7] + "_duration";
                        RepeatingSpellSave = "repeating_lvl-" + SpellLevel + "-spells_" + slc[7] + "_save";
                        RepeatingSpellSR = "repeating_lvl-" + SpellLevel + "-spells_" + slc[7] + "_SR";
                        RepeatingSpellDescription = "repeating_lvl-" + SpellLevel + "-spells_" + slc[7] + "_description";
                        AddAttribute(RepeatingSpellName, SpellName, Character.id);
                        AddAttribute(RepeatingSpellSchool, SpellSchool, Character.id);
                        AddAttribute(RepeatingSpellCastTime, SpellCastTime, Character.id);
                        AddAttribute(RepeatingSpellComponents, SpellComponents, Character.id);
                        AddAttribute(RepeatingSpellRange, SpellRange, Character.id);
                        AddAttribute(RepeatingSpellTargets, SpellTargets, Character.id);
                        AddAttribute(RepeatingSpellDuration, SpellDuration, Character.id);
                        AddAttribute(RepeatingSpellSave, SpellSave, Character.id);
                        AddAttribute(RepeatingSpellSR, SpellSR, Character.id);
                        AddAttribute(RepeatingSpellDescription, SpellDescription, Character.id);
                        slc[7]++;
                    };
                    if (SpellBlock[sb].indexOf(" level='8'") >= 0) {
                        RepeatingSpellName = "repeating_lvl-" + SpellLevel + "-spells_" + slc[8] + "_name";
                        RepeatingSpellSchool = "repeating_lvl-" + SpellLevel + "-spells_" + slc[8] + "_school";
                        RepeatingSpellCastTime = "repeating_lvl-" + SpellLevel + "-spells_" + slc[8] + "_cast-time";
                        RepeatingSpellComponents = "repeating_lvl-" + SpellLevel + "-spells_" + slc[8] + "_components";
                        RepeatingSpellRange = "repeating_lvl-" + SpellLevel + "-spells_" + slc[8] + "_range";
                        RepeatingSpellTargets = "repeating_lvl-" + SpellLevel + "-spells_" + slc[8] + "_targets";
                        RepeatingSpellDuration = "repeating_lvl-" + SpellLevel + "-spells_" + slc[8] + "_duration";
                        RepeatingSpellSave = "repeating_lvl-" + SpellLevel + "-spells_" + slc[8] + "_save";
                        RepeatingSpellSR = "repeating_lvl-" + SpellLevel + "-spells_" + slc[8] + "_SR";
                        RepeatingSpellDescription = "repeating_lvl-" + SpellLevel + "-spells_" + slc[8] + "_description";
                        AddAttribute(RepeatingSpellName, SpellName, Character.id);
                        AddAttribute(RepeatingSpellSchool, SpellSchool, Character.id);
                        AddAttribute(RepeatingSpellCastTime, SpellCastTime, Character.id);
                        AddAttribute(RepeatingSpellComponents, SpellComponents, Character.id);
                        AddAttribute(RepeatingSpellRange, SpellRange, Character.id);
                        AddAttribute(RepeatingSpellTargets, SpellTargets, Character.id);
                        AddAttribute(RepeatingSpellDuration, SpellDuration, Character.id);
                        AddAttribute(RepeatingSpellSave, SpellSave, Character.id);
                        AddAttribute(RepeatingSpellSR, SpellSR, Character.id);
                        AddAttribute(RepeatingSpellDescription, SpellDescription, Character.id);
                        slc[8]++;
                    };
                    if (SpellBlock[sb].indexOf(" level='9'") >= 0) {
                        RepeatingSpellName = "repeating_lvl-" + SpellLevel + "-spells_" + slc[9] + "_name";
                        RepeatingSpellSchool = "repeating_lvl-" + SpellLevel + "-spells_" + slc[9] + "_school";
                        RepeatingSpellCastTime = "repeating_lvl-" + SpellLevel + "-spells_" + slc[9] + "_cast-time";
                        RepeatingSpellComponents = "repeating_lvl-" + SpellLevel + "-spells_" + slc[9] + "_components";
                        RepeatingSpellRange = "repeating_lvl-" + SpellLevel + "-spells_" + slc[9] + "_range";
                        RepeatingSpellTargets = "repeating_lvl-" + SpellLevel + "-spells_" + slc[9] + "_targets";
                        RepeatingSpellDuration = "repeating_lvl-" + SpellLevel + "-spells_" + slc[9] + "_duration";
                        RepeatingSpellSave = "repeating_lvl-" + SpellLevel + "-spells_" + slc[9] + "_save";
                        RepeatingSpellSR = "repeating_lvl-" + SpellLevel + "-spells_" + slc[9] + "_SR";
                        RepeatingSpellDescription = "repeating_lvl-" + SpellLevel + "-spells_" + slc[9] + "_description";
                        AddAttribute(RepeatingSpellName, SpellName, Character.id);
                        AddAttribute(RepeatingSpellSchool, SpellSchool, Character.id);
                        AddAttribute(RepeatingSpellCastTime, SpellCastTime, Character.id);
                        AddAttribute(RepeatingSpellComponents, SpellComponents, Character.id);
                        AddAttribute(RepeatingSpellRange, SpellRange, Character.id);
                        AddAttribute(RepeatingSpellTargets, SpellTargets, Character.id);
                        AddAttribute(RepeatingSpellDuration, SpellDuration, Character.id);
                        AddAttribute(RepeatingSpellSave, SpellSave, Character.id);
                        AddAttribute(RepeatingSpellSR, SpellSR, Character.id);
                        AddAttribute(RepeatingSpellDescription, SpellDescription, Character.id);
                        slc[9]++;
                    };
                };
            };
        };
        // Attacks
        // Set Melee, Range, CMB based on user input
        AddAttribute("attk-melee-ability", AttkMeleeAbility, Character.id);
        AddAttribute("attk-ranged-ability", AttkRangedAbility, Character.id);
        AddAttribute("attk-CMB-ability", AttkCMBAbility, Character.id);
        
        log("The character has been imported!");
        
	};
});