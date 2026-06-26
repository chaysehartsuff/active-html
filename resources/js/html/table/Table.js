import Element from '../Element.js';
import Model from '../../models/Model.js';
import Checkbox from '../Checkbox.js';
import Dao from '../../models/Dao.js';
import FieldType from '../../enum/FieldType.js';
import FormatType from '../../enum/FormatType.js';
import ThreeDotsIcon from '../icons/ThreeDotsIcon.js';
import CheckMarkIcon from '../icons/CheckMarkIcon.js';
import XMarkIcon from '../icons/XMarkIcon.js';
import QuickActionMenu from '../QuickActionMenu.js';
import ContentOverlay from '../ContentOverlay.js';

/**
 * A dynamic table component for rendering tabular data from a model.
 */
export default class Table extends Element {

    /**
     * The table columns 
     * @type {Array} columns
     */
    columns = [];

    column_defaults = {
        sortable: false,
        searchable: false,
        visible: true,
        editable: true,
        use_in_default_search: true, // whether this column should be included in the default "All Columns" search
        type: FieldType.STRING,
        search_options: null, // immediatly enforces a select search element with the provided options
        search_default: null, // default search value for the column
        search_element: null, // overrides default text search with a custom search element
        hideable: false, // whether this column can be hidden by the user
    };

    /**
     * Holds the active format processing for each column
     * @type {Object} columnFormats
     */
    columnFormats = {
        [FieldType.BOOLEAN]: FormatType.BOOLEAN.CHECKMARK_ICON,
        [FieldType.DATE]: FormatType.DATE.ABBREVIATED_TEXT,
        [FieldType.TIME]: FormatType.TIME.HOUR_12,
    }

    /** @type {Object} filterOptions */
    filterOptions = {
        page: 1,
        items_per_page: 5,
        columns: [],
        sort_columns: []
    };

    viewOptions = {
        show_search: true,
        show_pagination: true,
        show_per_page: true,
        show_hideable_columns: true,
    }

    rowActions = {
        edit: 'Edit',
    };


    /** @type {Element} table */
    table;
    /** @type {Element} tableHeader */
    tableHeader;
    /** @type {Element} tableBody */
    tableBody;
    /** @type {Element} tableFooter */
    tableFooter;

    /** @type {Element} searchInput */
    searchInput;

    /** @type {Array} rowsFetched */
    rowsFetched = [];

    /** @type {Object.<string, Element>} sortIndicatorElements */
    sortIndicatorElements = {};

    /** @type {Model} model */
    model;

    /** @type {number} total_rows Total number of rows available to paginate */
    total_rows = 0;

    /**
     * Dynamic table component for rendering tabular data from a model.
     * @param {String} elementId 
     * @param {Model} model 
     */
    constructor(elementId, model, columns = [], columnFormats = {}, filterOptions = {}, viewOptions = {}) {
        super();
        this.table = new Element();
        this.model = model;
        this.setColumns(columns);
        this.columnFormats = {...this.columnFormats, ...columnFormats};
        this.filterOptions = {...this.filterOptions, ...filterOptions};
        this.viewOptions = {...this.viewOptions, ...viewOptions};

        this.addClass("w-full border border-gray-200 rounded-lg overflow-hidden bg-white");
        this.createSearchBar();
        this.createHeader();
        this.createFooter();

        if(elementId) {
            let element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = this.compile();
                this.bindEvents();
            }
        }

        this.fetchRows();
    }

    /* Setters */

    /**
     * Sets the columns for the table.
     * Must include a 'name' and 'label' property for each column.
     * @param {Object[]} columns 
     */
    setColumns(columns) {
        // validate each column
        for (const column of columns) {
            if (!column.hasOwnProperty('name') || !column.hasOwnProperty('label')) {
                throw new Error('Each column must have a name and label property.');
            }
            for (const [key, value] of Object.entries(this.column_defaults)) {
                if (!column.hasOwnProperty(key)) {
                    column[key] = value;
                }
            }
        }
        this.columns = columns;
    }

    /**
     * Set an option for a specific column.
     * @param {string} columnName 
     * @param {string} optionKey 
     * @param {*} optionValue
     */
    setColumnOption(columnName, optionKey, optionValue) {
        const column = this.columns.find(col => col.name === columnName);
        if (column) {
            column[optionKey] = optionValue;
        } else {
            console.warn(`Column with name ${columnName} not found.`);
        }
    }

    /**
     * Sets a filter value for a specific column.
     * @param {string} columnKey 
     * @param {string} filterValue 
     * @param {string|null} betweenValue
     */
    setColumnFilter(columnKey, filterValue, betweenValue = null) {
        const columnIndex = this.filterOptions.columns.findIndex(col => col.key === columnKey);
        if (columnIndex !== -1) {
            this.filterOptions.columns[columnIndex].value = filterValue;
            if (betweenValue !== null) {
                this.filterOptions.columns[columnIndex].between_value = betweenValue;
            }
        } else {
            const newFilter = {key: columnKey, value: filterValue};
            if (betweenValue !== null) {
                newFilter.between_value = betweenValue;
            }
            this.filterOptions.columns.push(newFilter);
        }
    }

    /**
     * Apply ascending sort to a column
     * @param {string} columnKey
     */
    setAscSortColumn(columnKey){
        this.toggleSortColumn(columnKey, 'asc');
        this.updateSortIndicators();
        this.fetchRows();
    }
    /**
     * Apply descending sort to a column
     * @param {string} columnKey 
     */
    setDescSortColumn(columnKey){
        this.toggleSortColumn(columnKey, 'desc');
        this.updateSortIndicators();
        this.fetchRows();
    }

    /**
     * Set the button actions generated for each row
     * @param {Object} actions
     */
    setRowActions(actions){
        this.rowActions = actions;
    }

    /**
     * Add a button action generated for each row
     * @param {string} actionKey 
     * @param {string} actionLabel 
     */
    addRowAction(actionKey, actionLabel, callback = null){
        this.rowActions[actionKey] = {label: actionLabel, callback: callback};
    }

    /** 
     * Removes a filter for a specific column or all filters if no column key is provided.
     * @param {string|null|undefined} [columnKey]
     */
    removeColumnFilter(columnKey) {
        if (columnKey) {
            const columnIndex = this.filterOptions.columns.findIndex(col => col.key === columnKey);
            if (columnIndex !== -1) {
                this.filterOptions.columns.splice(columnIndex, 1);
            }
        } else {
            this.filterOptions.columns = [];
        }
    }

    /**
     * Clears all column filters from the table.
     */
    clearAllColumnFilters() {
        this.filterOptions.columns = [];
    }

    createSearchBar() {
        const searchBar = new Element()
            .addClass('flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200');

        const hideableColumns = [];

        // filter column dropdown
        const columnSelectWrapper = new Element().addClass('w-56');
        const columnSelect = new Element('select')
            .addClass('w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300')
            .onEvent('change', (e) => {
                const selectedColumn = e.target.value;
                this.clearAllColumnFilters();
                this.createSearchInputByColumn(selectedColumn);
                this.fetchRows();
            });

        // add default "All Columns" option
        columnSelect.addContent(new Element('option').setAttribute('value', '*').addContent('All'));
        for (const column of this.columns) {
            if (column.searchable) {
                const option = new Element('option')
                    .setAttribute('value', column.name)
                    .addContent(column.label);
                columnSelect.addContent(option);
            }
            if(column.hideable && this.viewOptions.show_hideable_columns){
                hideableColumns.push(column);
            }
        }

        this.textSearchWrapper = new Element().addClass('flex-1');
        this.createSearchInputByColumn('*');

        columnSelectWrapper.addContent(columnSelect);
        if(this.viewOptions.show_search){
            searchBar
                .addContent(columnSelectWrapper)
                .addContent(this.textSearchWrapper)
                ;
        }

        if (hideableColumns.length > 0) {
            const visibilityToggleWrapper = new Element()
                .addClass('max-w-sm xl:max-w-md overflow-x-auto');

            const visibilityToggleList = new Element()
                .addClass('flex items-center gap-2 min-w-max pr-1');

            for (const column of hideableColumns) {
                const toggleLabel = new Element('label')
                    .addClass('inline-flex items-center gap-2 px-2 py-1 text-xs text-gray-700 bg-white border border-gray-300 rounded-md whitespace-nowrap');
                console.log(`Column: ${column.name}, Visible: ${column.visible}`);
                let toggleCheckbox = new Checkbox()
                    .addClass('h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-300')
                    .setChecked(column.visible)
                    .onEvent('change', (e) => {
                        this.setColumnOption(column.name, 'visible', toggleCheckbox.checked());
                        this.createHeader();
                        this.fetchRows();
                    });

                toggleLabel
                    .addContent(toggleCheckbox)
                    .addContent(column.label);

                visibilityToggleList.addContent(toggleLabel);
            }

            visibilityToggleWrapper.addContent(visibilityToggleList);
            searchBar.addContent(visibilityToggleWrapper);
        }

        this.addContent(searchBar, 'searchBar', 0);
    }

    createSearchInputByColumn(columnName) {
        if(columnName === '*'){
            this.searchInput = new Element('input')
                .setAttribute('type', 'text')
                .setAttribute('placeholder', 'Search all...')
                .addClass('w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300')
                .onEvent('input', (e) => {
                    this.clearAllColumnFilters();
                    const searchValue = this.searchInput.getValue();
                    if(searchValue){
                        for(const column of this.columns){
                            if(column.searchable && column.use_in_default_search){
                                this.setColumnFilter(column.name, searchValue);
                            }
                        }
                    }
                    this.fetchRows();
                })
                ;
        this.textSearchWrapper.setContent(this.searchInput);
            return;
        }

        const column = this.columns.find(col => col.name === columnName);
        if (!column) {
            console.warn(`Column with name ${columnName} not found.`);
            return;
        }
        // LAST PRIORITY: Use a default search element based on column type
        switch (column.type) {
            case FieldType.BOOLEAN:
                this.searchInput = new Element('select')
                    .addClass('w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300');
                this.searchInput.addContent(new Element('option').setAttribute('value', 'all').addContent('All'));
                this.searchInput.addContent(new Element('option').setAttribute('value', 'true').addContent('True'));
                this.searchInput.addContent(new Element('option').setAttribute('value', 'false').addContent('False'));
                this.searchInput.onEvent('change', (e) => {
                    this.clearAllColumnFilters();
                    if(this.searchInput.getValue() != 'all'){
                        this.setColumnFilter(column.name, this.searchInput.getValue());
                    }
                    this.fetchRows();
                });
                break;
            case FieldType.DATE:
            case FieldType.TIME:
            case FieldType.DATETIME:
                this.searchInput = new Element('div').addClass('flex items-center gap-2');

                this.rangeStartInput = new Element('input')
                    .setAttribute('type', 'date')
                    .addClass('flex-1 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300')
                    ;

                const rangeSpacer = new Element('span')
                    .addClass('text-sm text-gray-500')
                    .addContent('to');

                this.rangeEndInput = new Element('input')
                    .setAttribute('type', 'date')
                    .addClass('flex-1 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300')
                    ;

                this.searchInput
                    .addContent(this.rangeStartInput)
                    .addContent(rangeSpacer)
                    .addContent(this.rangeEndInput);

                this.rangeStartInput.onEvent('change', (e) => {
                    if(this.rangeStartInput.getValue() && this.rangeEndInput.getValue()){
                        this.clearAllColumnFilters();
                        this.setColumnFilter(column.name, this.rangeStartInput.getValue(), this.rangeEndInput.getValue());
                        this.fetchRows();
                    }
                });
                this.rangeEndInput.onEvent('change', (e) => {
                    if(this.rangeStartInput.getValue() && this.rangeEndInput.getValue()){
                        this.clearAllColumnFilters();
                        this.setColumnFilter(column.name, this.rangeStartInput.getValue(), this.rangeEndInput.getValue());
                        this.fetchRows();
                    }
                });
                break;
            default:
                this.searchInput = new Element('input')
                    .setAttribute('type', 'text')
                    .setAttribute('placeholder', 'Search')
                    .addClass('w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300');

                    this.searchInput.onEvent('input', (e) => {
                        this.clearAllColumnFilters();
                        this.setColumnFilter(column.name, this.searchInput.getValue());
                        this.fetchRows();
                    });
        }
        if (column.search_options) {
            this.searchInput = new Element('select')
                .addClass('w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300');
            this.searchInput.addContent(new Element('option').setAttribute('value', '').addContent('All'));
            for (const option of column.search_options) {
                this.searchInput.addContent(new Element('option').setAttribute('value', option.value).addContent(option.label));
            }
        }
        // FIRST PRIORITY: Use a custom search element if provided in the column definition
        if (column.search_element instanceof Element) {
            this.searchInput = column.search_element;
        }
        if(column.search_default){
            this.searchInput.setAttribute('value', column.search_default);
        }

        this.textSearchWrapper.setContent(this.searchInput);
    }

    createHeader() {
        let totalColumns = this.columns.length + 1;
        // minus total columns with visible false
        for (const column of this.columns) {
            if (column.visible === false) {
                totalColumns--;
            }
        }

        this.sortIndicatorElements = {};
        this.removeContent('tableHeader');
        this.tableHeader = new Element()
            .addClass(`grid grid-cols-${totalColumns} bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700`);
        ;
        for (const column of this.columns) {
            if(column.visible === false){
                continue;
            }

            const headerCell = new Element().addClass('px-4 py-3');

            if (column.sortable === true) {
                const sortIndicator = new Element('span')
                    .addClass('text-base text-gray-500')
                    .addContent(this.getSortIndicator(column.name));

                this.sortIndicatorElements[column.name] = sortIndicator;

                const sortButton = new Element('button')
                    .setAttribute('type', 'button')
                    .addClass('inline-flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left text-base font-semibold text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300')
                    .setAttribute('title', 'Toggle sorting')
                    .addContent(column.label)
                    .addContent(sortIndicator)
                    .onEvent('click', (e) => {
                        if (e && typeof e.preventDefault === 'function') {
                            e.preventDefault();
                        }
                        this.toggleSortColumn(column.name);
                        this.updateSortIndicators();
                        this.fetchRows();
                    });

                headerCell.addContent(sortButton);
            } else {
                headerCell.addContent(column.label);
            }

            this.tableHeader.addContent(headerCell);
        }
        this.addContent(this.tableHeader, 'tableHeader', 1);
    }

    getSortDirection(columnKey) {
        const sortColumn = this.filterOptions.sort_columns.find(col => col.key === columnKey);
        return sortColumn ? sortColumn.direction : null;
    }

    getSortIndicator(columnKey) {
        const direction = this.getSortDirection(columnKey);
        if (direction === 'asc') {
            return '↑';
        }
        if (direction === 'desc') {
            return '↓';
        }
        return '↕';
    }

    toggleSortColumn(columnKey, direction = null) {
        const currentDirection = this.getSortDirection(columnKey);
        let nextDirection = direction;

        if (nextDirection === null) {
            if (currentDirection === 'asc') {
                nextDirection = 'desc';
            } else if (currentDirection === 'desc') {
                nextDirection = null;
            } else {
                nextDirection = 'asc';
            }
        }

        if (nextDirection === null) {
            this.filterOptions.sort_columns = [];
        } else {
            this.filterOptions.sort_columns = [{
                key: columnKey,
                direction: nextDirection,
            }];
        }

        this.filterOptions.page = 1;
    }

    updateSortIndicators() {
        for (const [columnKey, indicatorElement] of Object.entries(this.sortIndicatorElements)) {
            indicatorElement.setContent(this.getSortIndicator(columnKey));
        }
    }

    createFooter(){
        const pageButtonClass = 'inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-800 transition-colors';

        this.tableFooter = new Element().addClass('flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-t border-gray-200');

        const perPageControls = new Element().addClass('flex items-center gap-2 text-sm text-gray-600');
        const perPageLabel = new Element('span').addContent('Rows per page');
        const perPageSelect = new Element('select')
            .addClass('px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300')
            .onEvent('change', () => {
                const value = parseInt(perPageSelect.getValue(), 10);
                this.filterOptions.items_per_page = Number.isNaN(value) ? 10 : value;
                this.filterOptions.page = 1;
                this.fetchRows();
            });

        for (const optionValue of [5, 10, 15, 20, 50]) {
            const option = new Element('option')
                .setAttribute('value', optionValue)
                .addContent(String(optionValue));
            if (optionValue === this.filterOptions.items_per_page) {
                option.setAttribute('selected', 'selected');
            }
            perPageSelect.addContent(option);
        }

        perPageControls
            .addContent(perPageLabel)
            .addContent(perPageSelect);

        const paginationControls = new Element().addClass('flex items-center gap-2');

        const firstButton = new Element('button')
            .addClass(pageButtonClass)
            .setAttribute('type', 'button')
            .addContent('<<')
            .onEvent('click', () => {
                this.filterOptions.page = 1;
                this.fetchRows();
            });

        const previousButton = new Element('button')
            .addClass(pageButtonClass)
            .setAttribute('type', 'button')
            .addContent(new Element('span').addClass('text-base leading-none').addContent('←'))
            .addContent('Previous')
            .onEvent('click', () => {
                this.filterOptions.page = Math.max(1, this.filterOptions.page - 1);
                this.fetchRows();
            });

        this.pageIndicator = new Element('div')
            .addClass('px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-md')
            ;

        const nextButton = new Element('button')
            .addClass(pageButtonClass)
            .setAttribute('type', 'button')
            .addContent('Next')
            .addContent(new Element('span').addClass('text-base leading-none').addContent('→'))
            .onEvent('click', () => {
                this.filterOptions.page += 1;
                if(this.filterOptions.page > Math.ceil(this.total_rows / this.filterOptions.items_per_page)){
                    this.filterOptions.page = Math.ceil(this.total_rows / this.filterOptions.items_per_page);
                }
                this.fetchRows();
            })
            ;

        const lastButton = new Element('button')
            .addClass(pageButtonClass)
            .setAttribute('type', 'button')
            .addContent('>>')
            .onEvent('click', () => {
                this.filterOptions.page = Math.ceil(this.total_rows / this.filterOptions.items_per_page);
                this.fetchRows();
            })
            ;

        paginationControls
            .addContent(firstButton)
            .addContent(previousButton)
            .addContent(this.pageIndicator)
            .addContent(nextButton)
            .addContent(lastButton);

        this.tableFooter
            .addContent(perPageControls)
            .addContent(paginationControls);
        this.addContent(this.tableFooter, 'tableFooter', 3);
    }

    renderRows() {
        this.tableBody = new Element();
        let totalColumns = this.columns.length + 1;
        // minus total columns with visible false
        for (const column of this.columns) {
            if (column.visible === false) {
                totalColumns--;
            }
        }

        for (let i = 0; i < this.rowsFetched.length; i++) {
            let tableRow = new Element()
                .addClass(`grid grid-cols-${totalColumns} border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer`)
;
            for (const column of this.columns) {
                if(column.visible === false){
                    continue;
                }
                switch (column.type) {
                    case FieldType.BOOLEAN:
                        let formatKey = this.columnFormats[FieldType.BOOLEAN];
                        if (formatKey === FormatType.BOOLEAN.CHECKMARK_ICON) {
                            let boolValue = this.rowsFetched[i][column.name];
                            let boolDisplay = boolValue ?
                                new Element().addClass('w-5')
                                    .addContent(
                                        new CheckMarkIcon().addClass('w-5 h-5 text-green-500')
                                    ) :
                                new Element().addClass('w-5')
                                    .addContent(
                                        new XMarkIcon().addClass('w-5 h-5 text-red-500')
                                    );
                            tableRow.addContent(
                                new Element().addClass('px-4 py-3 text-gray-800')
                                    .addContent(boolDisplay)
                                    .onEvent('click', (e) => {this.runRowAction('edit', this.rowsFetched[i])})
                            );
                            break;
                        } else if (formatKey === FormatType.BOOLEAN.TRUE_FALSE) {
                            let boolValue = this.rowsFetched[i][column.name];
                            let boolDisplay = boolValue ? 'True' : 'False';
                            tableRow.addContent(
                                    new Element()
                                        .addClass('px-4 py-3 text-gray-800')
                                        .addContent(boolDisplay)
                                        .onEvent('click', (e) => {this.runRowAction('edit', this.rowsFetched[i])})
                                    );
                            break;
                        }
                        break;
                    case FieldType.DATE:
                    case FieldType.TIME:
                    case FieldType.DATETIME:
                        let dateValue = this.rowsFetched[i][column.name];
                        let formattedDate, formattedTime = new Element();
                        let dateKey = this.columnFormats[FieldType.DATE];
                        let timeKey = this.columnFormats[FieldType.TIME];
                        if (dateKey === FormatType.DATE.ABBREVIATED_TEXT) {
                            formattedDate = new Date(dateValue).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                        } else if (dateKey === FormatType.DATE.FULL_TEXT) {
                            formattedDate = new Date(dateValue).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                        } else if (dateKey === FormatType.DATE.ISO) {
                            formattedDate = new Date(dateValue).toISOString().split('T')[0];
                        } else {
                            formattedDate = new Date(dateValue).toLocaleDateString();
                        }
                        let timeValue = this.rowsFetched[i][column.name];
                        if (timeKey === FormatType.TIME.HOUR_12) {
                            formattedTime = new Date(timeValue).toLocaleTimeString(undefined, { hour: 'numeric', minute: 'numeric', hour12: true });
                        } else if (timeKey === FormatType.TIME.HOUR_24) {
                            formattedTime = new Date(timeValue).toLocaleTimeString(undefined, { hour: 'numeric', minute: 'numeric', hour12: false });
                        }
                        if(column.type === FieldType.DATE){
                            formattedTime = '';
                        }
                        if(column.type === FieldType.TIME){
                            formattedDate = '';
                        }
                        tableRow.addContent(
                            new Element()
                                .addClass('px-4 py-3 text-gray-800')
                                .addContent(formattedDate)
                                .addContent(' ')
                                .addContent(formattedTime)
                                .onEvent('click', (e) => {this.runRowAction('edit', this.rowsFetched[i])})
                        );
                        break;
                    default:
                        let rowValue = this.rowsFetched[i][column.name];
                        tableRow.addContent(
                            new Element()
                            .addClass('px-4 py-3 text-gray-800')
                            .addContent(rowValue)
                            .onEvent('click', (e) => {this.runRowAction('edit', this.rowsFetched[i])}));
                }
            }
            // add action for row on far right
            let actionButton = new Element()
                .addClass('px-4 py-3 text-gray-500 hover:text-gray-700 cursor-pointer max-w-90')
                .addContent(
                    new ThreeDotsIcon()
                        .addClass('w-5 ml-auto h-5')
                        .onEvent('click', (e) => { 
                            let actionMenu = new QuickActionMenu();
                            for(const action of this.getActionsForRow(this.rowsFetched[i])){
                                actionMenu.addAction(action.value, action.label, action.callback);
                                actionMenu.onEvent('mouseleave', (e) => {
                                    actionButton.removeContent('actionMenu');
                                });
                            }
                            actionButton.addContent(actionMenu, 'actionMenu');
                        })
                )
                ;
            tableRow.addContent(actionButton);

            this.tableBody.addContent(tableRow);
        }

        let footerIndex = null;
        if (this.hasContent('tableFooter')) {
            footerIndex = Array.from(this.contentStack.keys()).indexOf('tableFooter');
        }
        this.removeContent('tableBody');
        this.addContent(this.tableBody, 'tableBody', 2);
    }

    fetchRows() {
        Dao.modelRequest('getPagination', this.model, (response) => {
            if(response.errors.length > 0){
                console.error('Error fetching table data:', response.errors);
                return;
            }
            this.rowsFetched = response.models;
            this.total_rows = response.total;
            this.pageIndicator.setContent(`Page ${this.filterOptions.page} of ${Math.ceil(this.total_rows / this.filterOptions.items_per_page)}`);
            this.renderRows();
        }, {}, {
            "filter_options": this.filterOptions,
            "columns":  this.columns.map(col => col.name)
        });
    }

    getActionsForRow(row){
        let actions = [];
        for(const [actionKey, actionLabel] of Object.entries(this.rowActions)){
            if(typeof actionLabel === 'object' && actionLabel.callback){
                actions.push({
                    label: actionLabel.label,
                    callback: () => actionLabel.callback(row)
                });
                continue;
            }
            actions.push({
                label: actionLabel,
                callback: () => this.runRowAction(actionKey, row)
            });
        }
        return actions;
    }

    /** Checks if the method formatted like 'rowAction<actionKey>' exists and runs it, otherwise does nothing 
     * @param {string} actionKey
     * @param {object} row
     *
    */
    runRowAction(actionKey, row){
        if(this.rowActions[actionKey] && typeof this.rowActions[actionKey].callback === 'function'){
            this.rowActions[actionKey].callback(row);
            return;
        }
        const methodName = `rowAction${actionKey.charAt(0).toUpperCase() + actionKey.slice(1)}`;
        if(typeof this[methodName] === 'function'){
            this[methodName](row);
        } else {
            console.warn(`No method found for action ${actionKey}`);
        }
    }

    /** ROW ACTIONS */
    rowActionEdit(row){
        let editUrl = "/" + this.model.constructor.name.toLowerCase() + "/edit/" + row.id;
        window.location.href = editUrl;
    }
}