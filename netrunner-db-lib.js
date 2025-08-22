/**
 * Netrunner DB Editor - Core Library v0.9.1
 * Contains all stable application logic for the card editor.
 */

// --- To disable all AI features, comment out the line below ---
const AI_FEATURES_ENABLED = true;

// --- APPLICATION NAMESPACE ---
window.NetrunnerDB = {
    // --- STATE MANAGEMENT ---
    cardData: [],
    currentCardIndex: null,
    fileName: 'edited_cards.js',
    currentlyBuildingField: null, // Holds the key of the field being edited by the block builder

    // --- CONSTANTS ---
    ALL_POSSIBLE_FIELDS: [
        'title', 'imageFile', 'player', 'cardType', 'subTypes', 'faction', 'deckSize', 'influenceLimit', 'playCost', 'installCost', 'rezCost', 'memoryCost', 'advancementRequirement', 'strength', 'link', 'trashCost', 'agendaPoints', 'recurringCredits', 'memoryUnits', 'hostingMU', 'power', 'virus', 'agenda', 'unique', 'canBeAdvanced', 'Enumerate', 'Resolve', 'abilities', 'subroutines', 'text', 'canUseCredits', 'canHost', 'installOnlyOn', 'strengthBoost', 'strengthReduce', 'modifyStrength', 'modifyInstallCost', 'modifyAdvancementRequirement', 'accessAdditional', 'modifyBreachAccess', 'automaticOnInstall', 'automaticOnAccess', 'automaticOnEncounter', 'automaticOnAnyChange', 'responseOnRunSuccessful', 'responseOnRunEnds', 'responseOnEncounterEnds', 'responseOnRunnerTurnBegins', 'responseOnCorpTurnBegins', 'responseOnScored', 'responseOnStolen', 'responsePreventableAddTags', 'responsePreventableDamage', 'responsePreventableExpose', 'responsePreventableTrash'
    ],
    FIELD_DEFAULTS: {
        title: "New Card", imageFile: "", player: "runner", cardType: "event", subTypes: [], faction: "Neutral", deckSize: 45, influenceLimit: 15, playCost: 0, installCost: 0, rezCost: 0, memoryCost: 0, advancementRequirement: 0, strength: 0, link: 0, trashCost: 0, agendaPoints: 0, recurringCredits: 0, memoryUnits: 0, hostingMU: 0, power: 0, virus: 0, agenda: 0, unique: false, canBeAdvanced: false, Enumerate: function () { return [{}]; }, Resolve: function (params) {}, abilities: [], subroutines: [], text: "", canUseCredits: function (doing, card) { return false; }, canHost: function (card) { return false; }, installOnlyOn: function (card) { return true; }, strengthBoost: 0, strengthReduce: 0, modifyStrength: { Resolve: function (card) { return 0; } }, modifyInstallCost: { Resolve: function (card) { return 0; } }, modifyAdvancementRequirement: { Resolve: function (card) { return 0; } }, accessAdditional: 0, modifyBreachAccess: { Resolve: function () { return 0; } }, automaticOnInstall: { Resolve: function (card) {} }, automaticOnAccess: { Resolve: function (card) {} }, automaticOnEncounter: { Resolve: function (card) {} }, automaticOnAnyChange: { Resolve: function () {} }, responseOnRunSuccessful: { Resolve: function () {} }, responseOnRunEnds: { Resolve: function () {} }, responseOnEncounterEnds: { Resolve: function () {} }, responseOnRunnerTurnBegins: { Resolve: function () {} }, responseOnCorpTurnBegins: { Resolve: function () {} }, responseOnScored: { Resolve: function () {} }, responseOnStolen: { Resolve: function () {} }, responsePreventableAddTags: { Resolve: function () {} }, responsePreventableDamage: { Resolve: function () {} }, responsePreventableExpose: { Resolve: function () {} }, responsePreventableTrash: { Resolve: function () {} }
    },
    PLAYER_OPTIONS: ["runner", "corp"],
    CARD_TYPE_OPTIONS: ["identity", "event", "hardware", "program", "resource", "asset", "agenda", "operation", "ice", "upgrade"],
    SUBTYPE_OPTIONS: [
        [], ["Virus"], ["Sentry", "Tracer", "Observer"], ["Chip"], ["Console"], ["Icebreaker", "Decoder"], ["Connection"], ["Ambush"], ["Megacorp"], ["Code Gate"], ["Run"], ["Icebreaker", "Fracter"], ["Icebreaker", "Killer"], ["Icebreaker", "AI"], ["Barrier"], ["Job"], ["Sabotage"], ["G-mod"], ["Run", "Sabotage"], ["Daemon"], ["Virtual"], ["Seedy"], ["Natural"], ["Location"], ["Mod"], ["Remote"], ["Link"], ["Barrier", "Bioroid", "AP"], ["Code Gate", "Bioroid", "AP"], ["Sentry", "Destroyer"], ["Initiative"], ["Ambush", "Research"], ["Sysop", "Unorthodox"], ["Region"], ["Expansion"], ["Security"], ["Advertisement"], ["Transaction"], ["Code Gate", "Deflector"], ["Trap", "AP"], ["Sentry", "AP"], ["Barrier", "AP"], ["Cyborg"], ["Cybernetic"], ["Console", "Cybernetic"], ["Gear"], ["Cast"], ["Hostile"], ["Public", "Initiative"], ["Division"], ["Black Ops"], ["Gray Ops"], ["Genetics"], ["Ritzy"]
    ],
    BUILDER_FIELDS: ['Resolve', 'Enumerate', 'automaticOnInstall', 'automaticOnAccess', 'automaticOnEncounter', 'automaticOnAnyChange', 'responseOnRunSuccessful', 'responseOnRunEnds', 'responseOnEncounterEnds', 'responseOnRunnerTurnBegins', 'responseOnCorpTurnBegins', 'responseOnScored', 'responseOnStolen', 'responsePreventableAddTags', 'responsePreventableDamage', 'responsePreventableExpose', 'responsePreventableTrash'],


    // --- DOM CACHE ---
    dom: {},
    cacheDom: function() {
        this.dom.fileUpload = document.getElementById('file-upload');
        this.dom.downloadBtn = document.getElementById('download-btn');
        this.dom.addCardBtn = document.getElementById('add-card-btn');
        this.dom.startNewBtn = document.getElementById('start-new-btn');
        this.dom.cardList = document.getElementById('card-list');
        this.dom.editorHeader = document.getElementById('editor-header');
        this.dom.editorTitle = document.getElementById('editor-title');
        this.dom.editorContent = document.getElementById('editor-content');
        this.dom.welcomeMessage = document.getElementById('welcome-message');
        this.dom.saveCardBtn = document.getElementById('save-card-btn');
        this.dom.deleteCardBtn = document.getElementById('delete-card-btn');
        this.dom.messageBox = document.getElementById('message-box');
        this.dom.messageText = document.getElementById('message-text');
        this.dom.generateCardBtn = document.getElementById('generate-card-btn');
        this.dom.aiPromptInput = document.getElementById('ai-prompt');
        this.dom.aiToolsBar = document.getElementById('ai-tools-bar');
        this.dom.manageFieldsBtn = document.getElementById('manage-fields-btn');
        this.dom.fieldsModal = document.getElementById('fields-modal');
        this.dom.closeModalBtn = document.getElementById('close-modal-btn');
        this.dom.modalFieldsList = document.getElementById('modal-fields-list');
        this.dom.newFieldSelect = document.getElementById('new-field-select');
        this.dom.addFieldBtn = document.getElementById('add-field-btn');
        this.dom.applyFieldsBtn = document.getElementById('apply-fields-btn');
        this.dom.blockBuilderModal = document.getElementById('block-builder-modal');
        this.dom.closeBlockBuilderBtn = document.getElementById('close-block-builder-btn');
    },

    // --- FILE HANDLING ---
    handleStartNewFile: function() {
        this.cardData = [];
        this.currentCardIndex = null;
        this.fileName = 'new_card_set.js';
        this.resetEditor();
        this.renderCardList();
        this.dom.downloadBtn.disabled = false;
        this.dom.addCardBtn.disabled = false;
        this.showMessage('New file started. Add your first card!', 'success');
    },

    handleFileUpload: function(event) {
        const file = event.target.files[0];
        if (!file) return;
        this.fileName = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                // Define all potential global variables the scripts might need.
                const executionContent = `var runner = "runner"; var corp = "corp"; var setIdentifiers = [];\n${content}\n; return cardSet || coreSet;`;
                const func = new Function(executionContent);
                const loadedData = func();
                if (Array.isArray(loadedData)) {
                    this.cardData = loadedData;
                } else {
                    this.cardData = [];
                    for (const key in loadedData) {
                        this.cardData[parseInt(key)] = loadedData[key];
                    }
                }
                this.renderCardList();
                this.resetEditor();
                this.dom.downloadBtn.disabled = false;
                this.dom.addCardBtn.disabled = false;
                this.showMessage('File loaded successfully!', 'success');
            } catch (error) {
                console.error("Error parsing file:", error);
                this.showMessage('Failed to parse the file. Check console for details.', 'error');
            }
        };
        reader.readAsText(file);
    },

    handleFileDownload: function() {
        if (this.cardData.length === 0) {
            this.showMessage('No data to save.', 'error');
            return;
        }
        let fileContent = "// CARD DEFINITIONS\nvar coreSet = [];\n\n";
        this.cardData.forEach((card, index) => {
            if (card) {
                fileContent += `coreSet[${index}] = ${this.objectToString(card)};\n\n`;
            }
        });
        const blob = new Blob([fileContent], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showMessage('File saved!', 'success');
    },

    // --- UI RENDERING ---
    renderCardList: function() {
        this.dom.cardList.innerHTML = '';
        if (this.cardData.filter(Boolean).length === 0) {
             const message = this.dom.addCardBtn.disabled 
                ? 'Load a file or start new to see cards.' 
                : "No cards yet. Click '+' to add one.";
             this.dom.cardList.innerHTML = `<p class="text-gray-500 text-center p-4">${message}</p>`;
             return;
        }
        this.cardData.forEach((card, index) => {
            if (card) {
                const cardElement = document.createElement('div');
                cardElement.className = `p-3 my-1 rounded-lg cursor-pointer transition duration-200 ${this.currentCardIndex === index ? 'bg-cyan-700 text-white' : 'bg-gray-700 hover:bg-gray-600'}`;
                cardElement.textContent = card.title || `Card ${index}`;
                cardElement.dataset.index = index;
                cardElement.addEventListener('click', () => this.selectCard(index));
                this.dom.cardList.appendChild(cardElement);
            }
        });
    },
    
    renderEditor: function(index) {
        this.currentCardIndex = index;
        const card = this.cardData[index];
        if (!card) return;
        this.dom.welcomeMessage.classList.add('hidden');
        this.dom.editorHeader.classList.remove('hidden');
        this.dom.editorTitle.textContent = card.title || `Editing Card ${index}`;
        this.dom.editorContent.innerHTML = '';
        const form = document.createElement('form');
        form.className = 'space-y-4';
        for (const key in card) {
            const value = card[key];
            const formGroup = document.createElement('div');
            formGroup.className = 'flex flex-col';
            const labelContainer = document.createElement('div');
            labelContainer.className = 'flex items-center mb-1';
            const label = document.createElement('label');
            label.className = 'property-key text-sm';
            label.textContent = key;
            labelContainer.appendChild(label);

            if (this.BUILDER_FIELDS.includes(key)) {
                const buildBtn = document.createElement('button');
                buildBtn.type = 'button';
                buildBtn.innerHTML = '🏗️';
                buildBtn.title = 'Open Block Programmer';
                buildBtn.className = 'ml-2 bg-gray-600 hover:bg-gray-500 text-white font-bold w-6 h-6 rounded text-xs flex items-center justify-center';
                buildBtn.onclick = () => {
                    this.currentlyBuildingField = key;
                    this.dom.blockBuilderModal.classList.remove('hidden');
                };
                labelContainer.appendChild(buildBtn);
            }

            try {
                if (AI_FEATURES_ENABLED && key === 'text') {
                    const suggestBtn = document.createElement('button');
                    suggestBtn.type = 'button';
                    suggestBtn.innerHTML = '✨';
                    suggestBtn.title = 'Suggest Flavor Text';
                    suggestBtn.className = 'ml-2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold w-6 h-6 rounded-full text-xs flex items-center justify-center';
                    suggestBtn.onclick = () => this.handleGenerateFlavorText(suggestBtn);
                    labelContainer.appendChild(suggestBtn);
                }
            } catch(e) {/* AI disabled */}

            formGroup.appendChild(labelContainer);
            
            let input;
            if (key === 'player' || key === 'cardType' || key === 'subTypes') {
                input = document.createElement('select');
                let options;
                if (key === 'player') options = this.PLAYER_OPTIONS;
                if (key === 'cardType') options = this.CARD_TYPE_OPTIONS;
                if (key === 'subTypes') options = this.SUBTYPE_OPTIONS;
                if (key === 'subTypes') {
                    const currentValueString = JSON.stringify(value);
                    options.forEach(opt => {
                        const optionEl = document.createElement('option');
                        const optValueString = JSON.stringify(opt);
                        optionEl.value = optValueString;
                        optionEl.textContent = opt.length > 0 ? opt.join(' - ') : 'None';
                        if (optValueString === currentValueString) optionEl.selected = true;
                        input.appendChild(optionEl);
                    });
                } else {
                    options.forEach(opt => {
                        const optionEl = document.createElement('option');
                        optionEl.value = opt;
                        optionEl.textContent = opt;
                        if (opt === value) optionEl.selected = true;
                        input.appendChild(optionEl);
                    });
                }
            } else {
                const valueType = typeof value;
                if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
                    input = document.createElement('input');
                    input.type = 'text';
                    input.value = value;
                } else if (Array.isArray(value)) {
                    input = document.createElement('input');
                    input.type = 'text';
                    input.value = JSON.stringify(value);
                } else if (valueType === 'object' && value !== null) {
                    input = document.createElement('textarea');
                    input.rows = 5;
                    input.value = this.objectToString(value, 2);
                } else {
                    input = document.createElement('textarea');
                    input.rows = 5;
                    input.value = value ? value.toString() : String(value);
                }
            }
            
            input.name = key;
            input.className = 'bg-gray-800 border border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200';
            formGroup.appendChild(input);
            form.appendChild(formGroup);
        }
        this.dom.editorContent.appendChild(form);
    },

    resetEditor: function() {
        this.currentCardIndex = null;
        this.dom.welcomeMessage.classList.remove('hidden');
        this.dom.editorHeader.classList.add('hidden');
        this.dom.editorContent.innerHTML = '';
        this.dom.editorContent.appendChild(this.dom.welcomeMessage);
    },

    // --- CARD ACTIONS ---
    selectCard: function(index) {
        this.currentCardIndex = index;
        this.renderCardList();
        this.renderEditor(index);
    },

    handleAddCard: function() {
        const newCard = { title: "New Card", cardType: "event", player: "runner" };
        const newIndex = this.cardData.reduce((max, val, idx) => val ? Math.max(max, idx) : max, 0) + 1;
        this.cardData[newIndex] = newCard;
        this.renderCardList();
        this.selectCard(newIndex);
        this.showMessage('New card added!', 'success');
    },

    handleSaveChanges: function() {
        if (this.currentCardIndex === null) return;
        const form = this.dom.editorContent.querySelector('form');
        const formData = new FormData(form);
        const updatedCard = this.cardData[this.currentCardIndex]; 

        for (let [key, value] of formData.entries()) {
            try {
                if (key === 'player' || key === 'cardType') {
                    updatedCard[key] = value;
                    continue;
                }
                if (key === 'subTypes') {
                    updatedCard[key] = JSON.parse(value);
                    continue;
                }
                if ((value.startsWith('{') && value.endsWith('}')) || (value.startsWith('[') && value.endsWith(']'))) {
                    updatedCard[key] = new Function(`return ${value}`)();
                } else if (!isNaN(value) && value.trim() !== '' && !isNaN(parseFloat(value))) {
                    updatedCard[key] = Number(value);
                } else if (value === 'true' || value === 'false') {
                    updatedCard[key] = (value === 'true');
                } else {
                    updatedCard[key] = value;
                }
            } catch (e) {
                console.warn(`Could not parse property '${key}'. Saving as string.`, e);
                updatedCard[key] = value;
            }
        }
        this.cardData[this.currentCardIndex] = updatedCard;
        this.renderCardList();
        this.dom.editorTitle.textContent = updatedCard.title || `Editing Card ${this.currentCardIndex}`;
        this.showMessage('Card saved successfully!', 'success');
    },

    handleDeleteCard: function() {
        if (this.currentCardIndex === null) return;
        if (confirm(`Are you sure you want to delete "${this.cardData[this.currentCardIndex].title}"?`)) {
            delete this.cardData[this.currentCardIndex];
            this.resetEditor();
            this.renderCardList();
            this.showMessage('Card deleted.', 'success');
        }
    },
    
    // --- FIELD MANAGEMENT MODAL ---
    openManageFieldsModal: function() {
        if (this.currentCardIndex === null) return;
        const card = this.cardData[this.currentCardIndex];
        this.dom.modalFieldsList.innerHTML = '';
        const currentKeys = Object.keys(card);
        currentKeys.forEach(key => this.createFieldListItem(key));
        this.populateFieldDropdown();
        this.dom.fieldsModal.classList.remove('hidden');
    },
    
    createFieldListItem: function(key) {
         const fieldItem = document.createElement('div');
         fieldItem.className = 'flex justify-between items-center bg-gray-700 p-2 rounded';
         fieldItem.dataset.key = key;
         const fieldName = document.createElement('span');
         fieldName.textContent = key;
         fieldItem.appendChild(fieldName);
         const removeBtn = document.createElement('button');
         removeBtn.textContent = 'Remove';
         removeBtn.className = 'text-red-400 hover:text-red-300 text-sm';
         removeBtn.onclick = () => {
            fieldItem.remove();
            this.populateFieldDropdown();
         };
         fieldItem.appendChild(removeBtn);
         this.dom.modalFieldsList.appendChild(fieldItem);
    },

    populateFieldDropdown: function() {
        this.dom.newFieldSelect.innerHTML = '';
        const modalKeys = Array.from(this.dom.modalFieldsList.querySelectorAll('div')).map(div => div.dataset.key);
        const availableFields = this.ALL_POSSIBLE_FIELDS.filter(f => !modalKeys.includes(f));
        availableFields.forEach(field => {
            const option = document.createElement('option');
            option.value = field;
            option.textContent = field;
            this.dom.newFieldSelect.appendChild(option);
        });
    },

    handleAddFieldToModal: function() {
        const newKey = this.dom.newFieldSelect.value;
        if (!newKey) {
            this.showMessage('No field selected.', 'error');
            return;
        }
        this.createFieldListItem(newKey);
        this.populateFieldDropdown();
    },

    handleApplyFieldChanges: function() {
        if (this.currentCardIndex === null) return;
        const oldCard = this.cardData[this.currentCardIndex];
        const newCard = {};
        const desiredKeys = Array.from(this.dom.modalFieldsList.querySelectorAll('div')).map(div => div.dataset.key);

        this.ALL_POSSIBLE_FIELDS.forEach(field => {
            if (desiredKeys.includes(field)) {
                newCard[field] = oldCard.hasOwnProperty(field) ? oldCard[field] : (this.FIELD_DEFAULTS[field] !== undefined ? this.FIELD_DEFAULTS[field] : '');
            }
        });

        this.cardData[this.currentCardIndex] = newCard;
        this.dom.fieldsModal.classList.add('hidden');
        this.renderEditor(this.currentCardIndex);
        this.showMessage('Card fields updated.', 'success');
    },

    // --- UTILITY FUNCTIONS ---
    objectToString: function(obj, space = 2) {
        const cache = new Set();
        return JSON.stringify(obj, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (cache.has(value)) return;
                cache.add(value);
            }
            if (typeof value === 'function') {
                return `FUNCTION_PLACEHOLDER${value.toString()}FUNCTION_PLACEHOLDER`;
            }
            return value;
        }, space)
        .replace(/"FUNCTION_PLACEHOLDER/g, '')
        .replace(/FUNCTION_PLACEHOLDER"/g, '')
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"');
    },

    showMessage: function(message, type = 'success') {
        this.dom.messageText.textContent = message;
        this.dom.messageBox.classList.remove('bg-green-600', 'bg-red-600', 'bg-gray-700');
        if (type === 'success') this.dom.messageBox.classList.add('bg-green-600');
        else if (type === 'error') this.dom.messageBox.classList.add('bg-red-600');
        else this.dom.messageBox.classList.add('bg-gray-700');
        
        this.dom.messageBox.classList.remove('opacity-0');
        setTimeout(() => {
            this.dom.messageBox.classList.add('opacity-0');
        }, 3000);
    },

    // --- GEMINI API FUNCTIONS ---
    // (Kept in core lib as they are stable features)
    fetchWithRetry: async function(url, options, retries = 3, backoff = 1000) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, options);
                if (response.ok) return response;
                if (response.status >= 400 && response.status < 500) throw new Error(`Client error: ${response.status}`);
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, i)));
            }
        }
    },

    handleGenerateCard: async function() {
        const userPrompt = this.dom.aiPromptInput.value.trim();
        if (!userPrompt) {
            this.showMessage('Please enter a card idea.', 'error');
            return;
        }
        this.dom.generateCardBtn.innerHTML = '<div class="loader"></div>';
        this.dom.generateCardBtn.disabled = true;
        const cardSchema = {
            type: "OBJECT",
            properties: {
                title: { type: "STRING" }, player: { type: "STRING", enum: this.PLAYER_OPTIONS }, cardType: { type: "STRING", enum: this.CARD_TYPE_OPTIONS }, subTypes: { type: "ARRAY", items: { type: "STRING" } }, playCost: { type: "NUMBER" }, installCost: { type: "NUMBER" }, rezCost: { type: "NUMBER" }, strength: { type: "NUMBER" }, trashCost: { type: "NUMBER" }, agendaPoints: { type: "NUMBER" }, text: { type: "STRING", description: "The card's main ability text or flavor text." }, subroutines: { type: "ARRAY", items: { type: "OBJECT", properties: { text: { type: "STRING" } } } }
            },
            required: ["title", "player", "cardType", "text"]
        };
        const systemPrompt = `You are a game designer for the card game Android: Netrunner. Your task is to generate a complete, balanced card object in JSON format based on a user's idea. Adhere strictly to the provided JSON schema. Ensure costs, strength, and abilities are thematically appropriate and balanced for gameplay. If a property is not applicable (e.g., 'strength' for an event), omit it from the final JSON.`;
        const fullPrompt = `${systemPrompt}\n\nUser Idea: "${userPrompt}"`;
        try {
            const payload = {
                contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
                generationConfig: { responseMimeType: "application/json", responseSchema: cardSchema }
            };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const response = await this.fetchWithRetry(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.candidates && result.candidates[0].content.parts[0].text) {
                const newCard = JSON.parse(result.candidates[0].content.parts[0].text);
                const newIndex = this.cardData.reduce((max, val, idx) => val ? Math.max(max, idx) : max, 0) + 1;
                this.cardData[newIndex] = newCard;
                if (!this.dom.addCardBtn.disabled) {
                   this.renderCardList();
                   this.selectCard(newIndex);
                } else {
                   this.handleStartNewFile();
                   this.cardData[newIndex] = newCard;
                   this.renderCardList();
                   this.selectCard(newIndex);
                }
                this.showMessage('✨ Card generated successfully!', 'success');
                this.dom.aiPromptInput.value = '';
            } else {
                throw new Error("Invalid response structure from API.");
            }
        } catch (error) {
            console.error("Error generating card:", error);
            this.showMessage('Failed to generate card. See console for details.', 'error');
        } finally {
            this.dom.generateCardBtn.innerHTML = 'Generate Card';
            this.dom.generateCardBtn.disabled = false;
        }
    },

    handleGenerateFlavorText: async function(button) {
        if (this.currentCardIndex === null) return;
        const card = this.cardData[this.currentCardIndex];
        button.innerHTML = '<div class="loader"></div>';
        button.disabled = true;
        const cardInfo = `Title: ${card.title}, Type: ${card.cardType}, Faction: ${card.player}, Subtypes: ${card.subTypes?.join(', ')}, Ability: ${card.text || 'N/A'}`;
        const prompt = `Generate a short, thematic, cyberpunk-style flavor text for an Android: Netrunner card with these properties: ${cardInfo}. The text should be evocative and fit the dystopian, high-tech world. Do not include the card's name or any quotes. Just the flavor text itself.`;
        try {
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const response = await this.fetchWithRetry(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.candidates && result.candidates[0].content.parts[0].text) {
                const flavorText = result.candidates[0].content.parts[0].text.trim();
                const textInput = this.dom.editorContent.querySelector('textarea[name="text"], input[name="text"]');
                if (textInput) {
                    textInput.value = flavorText;
                    this.showMessage('✨ Flavor text generated!', 'success');
                }
            } else {
                 throw new Error("Invalid response structure from API.");
            }
        } catch (error) {
            console.error("Error generating flavor text:", error);
            this.showMessage('Failed to generate flavor text.', 'error');
        } finally {
            button.innerHTML = '✨';
            button.disabled = false;
        }
    }
};
