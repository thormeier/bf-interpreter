/**
 * Stack that holds all data
 *
 * @param size Size of the stack, i.e. how many possible values
 *
 * @type {Function}
 */
var Stack = (function (size) {
    this.pointer = 0;
    this.elements = [];
    this.size = size;
    for (var i = 0; i < size; ++i) {
        this.elements.push(0);
    }
});

/**
 * Main application
 *
 * @param inputElement The textarea of the input
 * @param outputElement The textarea of the output (i.e. where to print stuff)
 *
 * @type {Function}
 */
var Application = (function (inputElement, outputElement) {
    this.stack = new Stack(30000);
    this.codeString = inputElement.value;
    this.outputElement = outputElement;

    /**
     * Executes the whole application
     */
    this.execute = function () {
        this.outputElement.value = '';

        var tokens = this.tokenize(this.codeString);
        // Add empty token
        tokens.push(new Token('', 0));
        this.executeNestinglevel(tokens, 0);
    };

    /**
     * Converts a string of code into Tokens with nesting levels
     *
     * @param code The code as string
     * @returns {Array}
     */
    this.tokenize = function (code) {
        var codeParts = code.split(""),
            tokens = [],
            nestingLevel = 0;
        for (var i = 0; i < codeParts.length; ++i) {
            if ('[' == codeParts[i]) {
                ++nestingLevel;
            } else if (']' == codeParts[i]) {
                --nestingLevel;
            } else if ('<' == codeParts[i]
                || '>' == codeParts[i]
                || '+' == codeParts[i]
                || '-' == codeParts[i]
                || '.' == codeParts[i]
                || ',' == codeParts[i]
            ) {
                tokens.push(new Token(codeParts[i], nestingLevel));
            }
        }

        return tokens;
    };

    /**
     * Executes the given nesting level
     *
     * @param tokens
     * @param level
     */
    this.executeNestinglevel = function (tokens, level) {
        var currentToken = null,
            nextLevelTokens = [],
            previousLevel = level,
            currentPointerPos = null;

        for (var i = 0; i < tokens.length; ++i) {
            currentToken = tokens[i];

            if (currentToken.level > level) {
                if (null == currentPointerPos) {
                    currentPointerPos = this.stack.pointer;
                }
                nextLevelTokens.push(currentToken);
            } else {
                if (currentToken.level < previousLevel) {
                    while (this.stack.elements[currentPointerPos] != 0) {
                        this.executeNestinglevel(nextLevelTokens, level + 1);
                    }

                    nextLevelTokens = [];
                    currentPointerPos = null;
                }

                this.stack = currentToken.execute(this.stack, this.outputElement);
            }

            previousLevel = currentToken.level;
        }
    };
});

/**
 * A single command token
 *
 * @param value Token itself
 * @param level Nesting level of the token
 *
 * @type {Function}
 */
var Token = (function (value, level) {
    this.value = value;
    this.level = level;
    this.execute = function (stack, outputField) {
        switch (this.value) {
            case '<':
                if (stack.pointer > 0) { --stack.pointer; }
            break;
            case '>':
                if (stack.pointer < stack.size) { ++stack.pointer; }
            break;
            case '+':
                ++stack.elements[stack.pointer];
            break;
            case '-':
                --stack.elements[stack.pointer];
            break;
            case '.':
                outputField.value += String.fromCharCode(stack.elements[stack.pointer]);
            break;
            case ',':
                var input = prompt("Input", "");
                stack.elements[stack.pointer] = input.charCodeAt(0);
            break;
        }
        return stack;
    };
});

/**
 * Run that stuff
 */
function run() {
    var a = new Application(
        document.getElementById('bf-code-input'),
        document.getElementById('bf-output')
    );
    a.execute();
}

/**
 * Put sample code in
 */
function helloWorld() {
    document.getElementById('bf-code-input').value = '>+++++++++[<++++++++>-]<.>+++++++[<++++>-]<+.+++++++..+++.[-]>++++++++[<++++>-] <.>+++++++++++[<++++++++>-]<-.--------.+++.------.--------.[-]>++++++++[<++++>-]<+.[-]++++++++++.';
}
