/**
 * @OnlyCurrentDoc
 */

// this runs the default functions
function doAll() {
    
    addHtmlTags();
    cleanNesting();
    threeEmptyLines();
    addParas();
    spaceParas();
    centerParas();
    htmlColour('<.+?>');
    htmlColour('&nbsp;');
}


// this adds html tags to: italics, bold, underline, strikethrough
function addHtmlTags() {
    
    var body_element = DocumentApp.getActiveDocument().getBody();
    var all_paras = body_element.getParagraphs();
    
    for (var para = 0; para < all_paras.length; para++) {
   	 
   	 var para_text = all_paras[para].editAsText();
   	 var changes = para_text.getTextAttributeIndices(); // get text indices where formatting changes
   	 
   	 if (changes.length > 0) {
   		 
   		 var is_italic = [];
   		 
   		 // check for italics
   		 for (var i = 0; i < changes.length; i++) {
   			 is_italic[i] = para_text.isItalic(changes[i]);
   		 }
   		 
   		 // add html tags for italics
   		 openCloseTags(para_text, changes, is_italic, '<em>', '</em>');
   		 
   		 // rinse and repeat for other formatting:
   		 
   		 changes = para_text.getTextAttributeIndices();
   		 
   		 var is_bold = [];
   		 for (var i = 0; i < changes.length; i++) { is_bold[i] = para_text.isBold(changes[i]); }
   		 openCloseTags(para_text, changes, is_bold, '<strong>', '</strong>');
   		 
   		 changes = para_text.getTextAttributeIndices();
   		 
   		 var is_underline = [];
   		 for (var i = 0; i < changes.length; i++) { is_underline[i] = para_text.isUnderline(changes[i]); }
   		 openCloseTags(para_text, changes, is_underline, '<u>', '</u>');
   		 
   		 changes = para_text.getTextAttributeIndices();
   		 
   		 var is_strikethrough = [];
   		 for (var i = 0; i < changes.length; i++) { is_strikethrough[i] = para_text.isStrikethrough(changes[i]); }
   		 openCloseTags(para_text, changes, is_strikethrough, '<strike>', '</strike>');
   	 }
    }
}

// this adds opening and closing tags around formatted text
function openCloseTags(para_text, changes, is_format, opening_tag, closing_tag) {
    
    for (var i = changes.length-1; i > -1; i--) {
   	 
   	 // if it's the start of formatted text
   	 if (is_format[i] && (i < 1 || !is_format[i-1])) {
   		 
   		 var closed = false;
   		 
   		 // find the end of formatted text
   		 for (j = i+1; j < changes.length; j++) {
   			 
   			 if (!is_format[j]) {
   				 para_text.insertText(changes[j], closing_tag);    // add closing tag
   				 j = changes.length;
   				 closed = true;
   			 }
   		 }
   		 
   		 // if the end wasn't found, add closing tag to the end of paragraph
   		 if (closed == false) {
   			 para_text.appendText(closing_tag);
   		 }
   		 
   		 para_text.insertText(changes[i], opening_tag);    // add opening tag to the start of formatted text
   	 }
    }
}

// this cleans up misnesting
function cleanNesting() {

    var body_element = DocumentApp.getActiveDocument().getBody();
    body_element.replaceText('</u></strike>', '</strike></u>');
    body_element.replaceText('</strong></strike>', '</strike></strong>');
    body_element.replaceText('</strong></u>', '</u></strong>');
    body_element.replaceText('</em></strike>', '</strike></em>');
    body_element.replaceText('</em></u>', '</u></em>');
    body_element.replaceText('</em></strong>', '</strong></em>');
}

// this finds three empty lines in a row and appends &nbsp; into the middle one
function threeEmptyLines() {
    
    var body_element = DocumentApp.getActiveDocument().getBody();
    var all_paras = body_element.getParagraphs();
    
    var para_length = [];
    
    for (var i = 0; i < all_paras.length-1; i++) {
   	 
   	 para_length[i] = all_paras[i].getText().length;
   	 
   	 if (i > 1 && para_length[i-2] == 0 && para_length[i-1] == 0 && para_length[i] == 0) {
   		 all_paras[i-1].appendText('&nbsp;');
   		 para_length[i-1] = 6;
   	 }
    }
}

// this adds <p> and </p> to paragraphs
function addParas() {

    var body_element = DocumentApp.getActiveDocument().getBody();
    var search_result = body_element.findText('^([^<]|<[^phuol/]|<u>).*$');    // find a paragraph containing something (but not header or list)

    while (search_result !== null) {
   	 var this_element = search_result.getElement();

   	 this_element.insertText(0, '<p>');
   	 this_element.appendText('</p>');

   	 search_result = body_element.findText('^([^<]|<[^phuol/]|<u>).*$', search_result);
    }
}

// this changes paragraphs containing only spaces to &nbsp;
function spaceParas() {
    
    var body_element = DocumentApp.getActiveDocument().getBody();
    body_element.replaceText('<p> +</p>', '<p>&nbsp;</p>');
}

// this adds proper alignment to centered paragraphs
function centerParas() {
    
    var body_element = DocumentApp.getActiveDocument().getBody();
    var all_paras = body_element.getParagraphs();
    
    for (var i = 0; i < all_paras.length-1; i++) {
   	 
   	 var align = all_paras[i].getAlignment();
   	 
   	 if (align == DocumentApp.HorizontalAlignment.CENTER) {
   		 
   		 all_paras[i].replaceText('<p>', '<p align="center">');
   	 }
    }
}

// this makes the <tags> blue and not bold/underlined etc
function htmlColour(target) {
    
    var color = '#3d85c6';    // change the colour between ' and ' if you want!
    
    var style = {};
    style[DocumentApp.Attribute.FOREGROUND_COLOR] = color;
    style[DocumentApp.Attribute.ITALIC] = false;
    style[DocumentApp.Attribute.BOLD] = false;
    style[DocumentApp.Attribute.UNDERLINE] = false;
    style[DocumentApp.Attribute.STRIKETHROUGH] = false;
    
    var body_element = DocumentApp.getActiveDocument().getBody();
    var search_result = body_element.findText(target);

    while (search_result !== null) {
   	 var this_element = search_result.getElement();
   	 var this_element_text = this_element.asText();
   	 
   	 this_element_text.setAttributes(search_result.getStartOffset(), search_result.getEndOffsetInclusive(), style);

   	 search_result = body_element.findText(target, search_result);
    }
}

// this removes all html tags from document
function removeHtml() {
    
    var body_element = DocumentApp.getActiveDocument().getBody();
    body_element.replaceText('<.+?>', '');
    body_element.replaceText('&nbsp;', ' ');
}

//Create custom menu when document is opened.
function onOpen() {
    DocumentApp.getUi().createMenu('Post to AO3')
   	 .addItem('Prepare for pasting into HTML Editor', 'doAll')
   	 .addItem('Remove HTML', 'removeHtml')
   	 .addToUi();
}

