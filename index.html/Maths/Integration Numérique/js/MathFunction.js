// GESTION DE LA SYNTAXE LATEX VERS MATHJS etc

class MathFunction {
    constructor(latexExpr) {
        this.init(latexExpr);
    }

    init(latexExpr) {
        // par défaut cest valide
        this.isSupported = {
            isValid: true,
            message: ""
        };
        this.latexExpr = latexExpr;
        this.mathjsExpr = this.fromLatexToMathjs(this.latexExpr);
        try{
            this.fct = math.compile(this.mathjsExpr);
            this.parsedExpr = math.parse(this.mathjsExpr);
        }
        catch (error) {
            this.isSupported.isValid = false;
            this.isSupported.message = error.message;
            return;
        }
        this.vars = this.getVariables(this.parsedExpr);
        
        // le reste du code ne supporte que les fct à 0 ou 1 var
        if(this.vars.length > 1){
            this.isSupported.isValid = false;
            this.isSupported.message = "Too many variables: 1 max.";
            return;
        }
        // peut recupérer une erreur de syntaxe qui n'a pas été vue avant
        try{
            this.valueAtZero = this.fct.evaluate({[this.vars[0]]: 0});
        }
        catch (error) {
            this.isSupported.isValid = false;
            this.isSupported.message = error.message;
            return;
        }
        if(this.mathjsExpr === ""){
            this.isSupported.isValid = false;
            this.isSupported.message = "Function not defined.";
            return;
        }
    }

    // faudrait rajouter une methode qui s'occuppe des caracteres speciaux
    
    addSpacesAroundLetters(inputString) {
        return inputString.replace(/([a-zA-Z])/g, ' $1 ');
    }

    findFirstOccurrence(mainString, substrings) {
        // reduce pour trouver la première occurrence
        const result = substrings.reduce((acc, substring) => {
            const index = mainString.indexOf(substring);
            // Si l'index est trouvé et est plus petit que l'index actuel, on met à jour
            if (index !== -1 && (acc.beforeIndex === -1 || index < acc.beforeIndex)) {
                return {beforeIndex: index, afterIndex: index + substring.length, fct: substring};
            }
            return acc;
        }, {beforeIndex: -1, afterIndex: -1, fct: ''});
    
        return result;
    }

    fracRec(latexExpr) {

        //recherche la premiere position de frac dans latex_expression
        let position = latexExpr.indexOf('frac');
        if (position === -1){
            return latexExpr;
        }
        //à chaque fois qu'on a un frac, il va aller chercher le numérateur et le dénominateur et rajouter un / entre les 2 et des parentheses autour: 
        let indexToCheck = position + 5; //on commence à +5 au lieu de +0 car frac a lui meme une taille de 4 et compteur doit etre différent de 0 donc on l'init à 1 et on compte pas le premier '{'.
        let newLatexExpr = latexExpr.slice(0, position + 5) + "("; // ce qu'on veut renvoyer
        let counter = 1;
        while(counter !== 0) { //numérateur
            if(latexExpr[indexToCheck] === '{'){
                counter += 1;
            }
            if(latexExpr[indexToCheck] === '}'){
                counter -= 1;
            }
            newLatexExpr += latexExpr[indexToCheck];
            indexToCheck += 1; //passe au carac d'apres
        }
        //ajoute un / à la position indexToCheck
        newLatexExpr += "/";
        indexToCheck += 1;
        counter = 1;
        newLatexExpr += "(";
        while(counter !== 0) {  //dénominateur
            if(latexExpr[indexToCheck] === '{'){
                counter += 1;
            }
            if(latexExpr[indexToCheck] === '}'){
                counter -= 1;
            }
            newLatexExpr += latexExpr[indexToCheck];
            indexToCheck += 1; //passe au carac d'apres
        }
        newLatexExpr += ")";
        newLatexExpr += latexExpr.slice(indexToCheck);
        //il faut maintenant enlever le frac qu'on avait trouvé
        newLatexExpr = newLatexExpr.replace('frac', '');
        //recurrence sur les frac:
        return this.fracRec(newLatexExpr);
    }

    fromLatexToMathjs(latexExpr) {
        // voir si ya d'autres fonctions à coder: il y a les constantes: pi e etc
        let mathjsExpr = latexExpr.replaceAll(' ', '');
        mathjsExpr = mathjsExpr.replaceAll('\\', ' ');
        mathjsExpr = mathjsExpr.replaceAll('cdot', '*');
        // valeur abs: |x| = sqrt(x^2)
        mathjsExpr = mathjsExpr.replaceAll('left|', 'sqrt((');
        mathjsExpr = mathjsExpr.replaceAll('right|', ')^2)');
        //fractions
        mathjsExpr = this.fracRec(mathjsExpr);
        // fonction mathématiques
        // gere les \operatorname{...}
        mathjsExpr = mathjsExpr.replace(/operatorname{(.*?)}/g, '$1');
        // fonctions latex vers mathjs
        mathjsExpr = this.latexToMathjsFunctions(mathjsExpr);
        mathjsExpr = mathjsExpr.replaceAll('left', '');
        mathjsExpr = mathjsExpr.replaceAll('right', '');
        mathjsExpr = mathjsExpr.replaceAll('{', '(');
        mathjsExpr = mathjsExpr.replaceAll('}', ')');
        //rajoute des espaces pour la multiplication implicite
        mathjsExpr = this.spaceManage(mathjsExpr);
        return mathjsExpr;
    }

    // méthode pour extraire les variables de parsedExpr
    getVariables(parsedExpr) {
        const variables = new Set();
        // Fonction récursive pour parcourir les nœuds
        function traverse(node) {
            if (node.isSymbolNode && node.name.length === 1) {
                variables.add(node.name);
            } else if (node.isOperatorNode) {
                node.args.forEach(traverse);
            } else if (node.isFunctionNode) {
                node.args.forEach(traverse);
            } else if (node.isParenthesisNode) {
                traverse(node.content); // Parcours le contenu des parenthèses
            }
        }
        traverse(parsedExpr);
        // enleve "e" et "pi" au set: ce sont des cte, pas des vars
        variables.delete('pi');
        variables.delete('e');
        // Convertir le Set en tableau et le retourner
        return Array.from(variables);
    }

    validateAndExplain() {
        // par défaut cest valide
        const result = {
            isValid: true,
            message: ""
        };
        if(this.vars.length > 1){
            result.isValid = false;
            result.message = "Trop de variables."
            return result;
        } 
        if(this.vars.length > 1){
            result.isValid = false;
            result.message = "Trop de variables."
            return result;
        } 
    }

    // transforme les noms de fct latex vers ceux mathjs
    latexToMathjsFunctions(latexExpr) {
        // il faut d'abord transformer les fct trigo classiques
        // qui apparaissent dans les fct trigo plus avancées
        const replacements = [
            { latexName: 'Gamma', mathjsName: 'gamma' },
            //{ latexName: 'cos', mathjsName: 'cos' },
            //{ latexName: 'tan', mathjsName: 'tan' },
            { latexName: 'cotan', mathjsName: 'cot' },
            //{ latexName: 'sec', mathjsName: 'sec' },
            { latexName: 'cosec', mathjsName: 'csc' },
            { latexName: 'ln', mathjsName: 'log' },
            //{ latexName: 'e^', mathjsName: 'exp' },
            { latexName: 'pi', mathjsName: ' pi ' },
        ];
        replacements.forEach(({ latexName, mathjsName: mathjsName }) => {
            latexExpr = latexExpr.replaceAll(latexName, mathjsName);
        });
        // ensuite, la seule diff est que "arc" en latex devient "a" en mathjs
        return latexExpr.replaceAll("arc", "a");;
    }

    // rajoute des espaces là où il faut: entre les lettres hors def fct pour la mult implicite
    spaceManage(mathjsExpr) {
        // init
        const functions = [
            // spéciales
            "zeta", "gamma",
            // trigo réciproques hyperboliques
            "asinh", "acosh",
            "atanh", "acoth", 
            "asech", "acsch", 
            // trigo hyperboliques
            "cosh", "sinh",
            "tanh", "coth",
            "sech", "csch",
            // trigo réciproques classiques
            "asin", "acos",
            "atan", "acot",
            "asec", "acsc",
            // trigo classiques
            "cos", "sin", 
            "tan", "cot",
            "sec", "csc",
            // classiques
            "exp", "log", "pow", "sqrt", "abs",
            //constantes
            "pi"
        ];
        // index où se trouve la premiere occurrence d'un des elems de functions dans mathjsExpr
        // index du premier caractere apres la premiere occurrence d'un des elems de functions dans mathjsExpr
        const indexs = {beforeIndex: 0, afterIndex: 0};
        let fct; // fonction trouvée par findFirstOccurrence
        let partialExpr = mathjsExpr; // expression partielle qui commence apres la derniere fct trouvée
        let result = '';
        // boucle qui trouve de gauche à droite les fct, ajoute avec des parentheses ce qu'il y
        // avait avant et recommence avec l'expr slicée
        while(indexs.beforeIndex !== -1){
            // trouve la premiere occurrence et renvoie la fct qui est la 1ere occurrence et sa position
            const firstFct = this.findFirstOccurrence(partialExpr, functions);
            // update les valeurs initiales
            indexs.afterIndex = firstFct.afterIndex;
            indexs.beforeIndex = firstFct.beforeIndex;
            fct = firstFct.fct;
            // ajoute des espaces autour des lettres se situant avant beforeIndex et ajoute la fct non modifiée
            result += this.addSpacesAroundLetters(partialExpr.slice(0, indexs.beforeIndex)) + fct;
            //update la str pour enlever ce qui a deja été pris en compte
            partialExpr = partialExpr.slice(indexs.afterIndex);
        }
        result += this.addSpacesAroundLetters(partialExpr.slice(indexs.afterIndex));
        return result.trim();
    }
}

