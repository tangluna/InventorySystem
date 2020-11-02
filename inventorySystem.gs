function formSubmitted (e) {
 // FIX SUBSTRINGS BASED ON VALUE IN PARENTHESES
  var spreadsheet = SpreadsheetApp.openById('1dn3pjlocLZAE1jnPvn1NW0rOOcOTUjelDkt_YJy60_s');
  var inventory = spreadsheet.getSheets()[0];
  
  var form = FormApp.openById('1jrQuMTIRJO11SHKB_8y12gFRtZk19uqIi9XDlzwD_5c');
  var questions = form.getItems();
  
//  Logger.log(items);
  
  var items = inventory.getRange(2, 1, inventory.getLastRow() - 1, inventory.getLastColumn());
  Logger.log(e.values[2]); // logging what choice selected
  
  if (e.values[1] === questions[0].asMultipleChoiceItem().getChoices()[0].getValue())
  { 
  Logger.log("Action choice" + e.values[1]);
  Logger.log("Form choice" + questions[0].asMultipleChoiceItem().getChoices()[0].getValue());
  var numStart = e.values[2].indexOf("(");
    var numEnd = e.values[2].indexOf(")");
    var wantThis = e.values[2].substring(0, e.values[2].length - 2 - (numEnd - numStart));
    Logger.log(wantThis);
    
    var itemRow = 0;
    var testValueWanted = e.values[5]; // how many of item is requested
    Logger.log("TestValueWanted: " + testValueWanted);
    
    for (i = 1; i < inventory.getLastRow(); i++)
    {
      if (wantThis == items.getCell(i, 1).getValue())
      {
        Logger.log("FOUND");
        itemRow = i;
        break;
      }
    }
    
    if (itemRow == 0)
    {
      Logger.log("ITEM WAS NOT FOUND"); 
    }
    else
    {
      Logger.log("INVENTORY CHECKED OUT");
      if (testValueWanted > items.getCell(itemRow, 4).getValue())
      {
         // more value requested than is in inventory
      } 
      else
      {
        // Ideal case! everything is happy :) 
        
        // adds as a string??? FIX
        
        items.getCell(itemRow, 4).setValue(items.getCell(itemRow, 4).getValue() - testValueWanted);
        items.getCell(itemRow, 13).setValue(e.values[0]);
        
        // TODO: add distributed location
        
        var subject = 'Inventory Request: ' + e.values[2].substring(0, e.values[2].length - 2 - (numEnd - numStart));
        var message = 'You have requested ' + e.values[5] + ' ' + e.values[2].substring(0, e.values[2].length - 2 - (numEnd - numStart)) + '\n'
        + 'Current location: ' + items.getCell(itemRow, 10).getValue() + '\n'
        + 'Specific location: ' + items.getCell(itemRow, 11).getValue() + '\n'
        + 'The items have been deducted from inventory.';
        
        MailApp.sendEmail(e.values[6], subject, message);
        Logger.log('Sending an email to ' + e.values[6] + '. With subject: ' + subject + ' And message: ' + message);
        
        /* Update email to admin
        
        var adminEmail = 'sturner@my.cuhsd.org';
        
        // TODO
        
        */
      }
    }
  } 
  else if (e.values[1] === questions[0].asMultipleChoiceItem().getChoices()[1].getValue())
  {
    Logger.log("INVENTORY RETURNED");
    var wantThis = e.values[7];
    var numReturned = parseInt(e.values[8]);
    Logger.log(wantThis);
    
    var itemRow = 0;
   
    for (i = 1; i < inventory.getLastRow(); i++)
    {
      if (wantThis == items.getCell(i, 1).getValue())
      {
        Logger.log("FOUND");
        itemRow = i;
        break;
      }
    }
    
    if (itemRow == 0)
    {
      Logger.log("ITEM WAS NOT FOUND"); 
    }
    else
    {
      Logger.log("Adding to inventory...");
      
        // Ideal case! everything is happy :) 
        
        items.getCell(itemRow, 4).setValue(items.getCell(itemRow, 4).getValue() + numReturned);
      items.getCell(itemRow, 13).setValue(e.values[0]);
      Logger.log("Added " + numReturned + " to inventory");
        
        // TODO: add distributed location
        
        var subject = 'Inventory Return: ' + e.values[7];
        var message = 'You have returned ' + e.values[8] + ' ' + e.values[7] + '\n'
        + 'The items have been added to inventory.';
        
        MailApp.sendEmail(e.values[6], subject, message);
        Logger.log('Sending an email to ' + e.values[6] + '. With subject: ' + subject + ' And message: ' + message);
        
        /* Update email to admin
        
        var adminEmail = 'sturner@my.cuhsd.org';
        
        // TODO
        
        */
    }
  }
}

function sheetEdited (e)
{
  // BUGS: IF MORE THAN 1 CELL IS DELETED TOGETHER NOT ALL CHOICES ARE DELETED
  // AT TIMES, IF A CHOICE IS ADDED WHILE A PREVIOUS ADD SCRIPT IS RUNNING, THE SECOND CHOICE ENDS UP REPLACING THE FIRST
  // Formatting cell borders can trigger a duplicate add
  var form = FormApp.openById('1jrQuMTIRJO11SHKB_8y12gFRtZk19uqIi9XDlzwD_5c');
  var items = form.getItems();
 // var action = items[0];
  var requestSelection = items[2].asListItem();
  var inventoryReturn = items[7].asListItem();
  var selectionChoices = requestSelection.getChoices();
  
  var spreadsheet = SpreadsheetApp.openById('1dn3pjlocLZAE1jnPvn1NW0rOOcOTUjelDkt_YJy60_s');
  var inventory = spreadsheet.getSheets()[0];
  
  if ((e.range.getColumn() == 1 || e.range.getColumn() == 4) && !e.oldValue && e.range.getCell(1,1).getValue().toString())
  {
    // MAY ALSO PASS IF ONLY 1 THING IS BLANK AND OTHER IS NOT
    // WAY TOO MANY CASES TO FIGURE OUT HERE T O D O 
    // Eventually, want to add descriptions of the items too
   if (e.range.getColumn() == 1 && inventory.getRange(e.range.getRow(), 4, e.range.getRow(), 4).getCell(1,1).getValue())
   {
     selectionChoices.splice(e.range.getRow() - 2, 0, requestSelection.createChoice(e.range.getCell(1,1).getValue().toString() + " (" + inventory.getRange(e.range.getRow(), 4, e.range.getRow(), 4).getCell(1,1).getValue().toString() + ")"));
     Logger.log("Case 1 - detected name added, adding to form");
     Logger.log(e.range.getCell(1,1).getValue().toString() + " (" + inventory.getRange(e.range.getRow(), 4, e.range.getRow(), 4).getCell(1,1).getValue().toString() + ")");
   }
   else if (e.range.getColumn() == 4 && inventory.getRange(e.range.getRow(), 1, e.range.getRow(), 1).getCell(1,1).getValue())
   {
     selectionChoices.splice(e.range.getRow() - 2, 0, requestSelection.createChoice(inventory.getRange(e.range.getRow(), 1, e.range.getRow(), 1).getCell(1,1).getValue().toString() + " (" + e.range.getCell(1,1).getValue().toString() + ")"));
     Logger.log("Case 2 - detected value added, adding to form");
     Logger.log(inventory.getRange(e.range.getRow(), 1, e.range.getRow(), 1).getCell(1,1).getValue().toString() + " (" + e.range.getCell(1,1).getValue().toString() + ")");
   }
   else
   {
      // One is empty, one is filled
     // not added to form unless all 2 cols are filled
     Logger.log("Case 3 - fields missing, no adding");
     Logger.log(inventory.getRange(e.range.getRow(), 1, e.range.getRow(), 1).getCell(1,1).getValue().toString() + " (" + inventory.getRange(e.range.getRow(), 4, e.range.getRow(), 4).getCell(1,1).getValue().toString() + ")");
   }
  }
  else
  {
    // Edit was updating something OR is in a column the form doesn't use
    Logger.log("something was updated");
    if (e.range.getColumn() == 1)
    {
      // Update was to item name
      //Logger.log("Old Val " + e.oldValue);
      //Logger.log("New Val " + e.value);
      //Logger.log(e.range.getRow());
      Logger.log(e.range.getCell(1,1));
      Logger.log("E val: " + inventory.getRange(e.range.getRow(), 1, e.range.getRow(), 1).getCell(1,1).getValue());
      Logger.log("Value: " + inventory.getRange(e.range.getRow(), 4, e.range.getRow(), 4).getCell(1,1).getValue());
      if (e.range.getCell(1,1).getValue() && inventory.getRange(e.range.getRow(), 4, e.range.getRow(), 4).getCell(1,1).getValue())
      {
        selectionChoices.splice(e.range.getRow() - 2, 1, requestSelection.createChoice(e.range.getCell(1,1).getValue() + " (" + inventory.getRange(e.range.getRow(), 4, e.range.getRow(), 4).getCell(1,1).getValue() + ")"));
        Logger.log("Changing name of choice");
        Logger.log(e.range.getCell(1,1).getValue() + " (" + inventory.getRange(e.range.getRow(), 4, e.range.getRow(), 4).getCell(1,1).getValue() + ")");
      } else {
        // one of required fields missing
        selectionChoices.splice(e.range.getRow() - 2, 1);
        Logger.log("Name removed, removing choice");
        Logger.log(inventory.getRange(e.range.getRow(), 1, e.range.getRow(), 1).getCell(1,1).getValue().toString() + " (" + inventory.getRange(e.range.getRow(), 4, e.range.getRow(), 4).getCell(1,1).getValue().toString() + ")");
      }
    }
    else if (e.range.getColumn() == 4)
    {
      // Update was to item quantity
      //Logger.log(e.range.getRow());
      if (e.range.getCell(1,1).getValue() && inventory.getRange(e.range.getRow(), 1, e.range.getRow(), 1).getCell(1,1).getValue())
      {
        selectionChoices.splice(e.range.getRow() - 2, 1, requestSelection.createChoice(inventory.getRange(e.range.getRow(), 1, e.range.getRow(), 1).getCell(1,1).getValue() + " (" + e.range.getCell(1,1).getValue() + ")"));
        Logger.log("Changing value of choice");
        Logger.log(inventory.getRange(e.range.getRow(), 1, e.range.getRow(), 1).getCell(1,1).getValue() + " (" + e.range.getCell(1,1).getValue() + ")");
      } else {
        // one of required fields missing
        selectionChoices.splice(e.range.getRow() - 2, 1);
        Logger.log("Value removed, removing choice");
        Logger.log(inventory.getRange(e.range.getRow(), 1, e.range.getRow(), 1).getCell(1,1).getValue().toString() + " (" + inventory.getRange(e.range.getRow(), 4, e.range.getRow(), 4).getCell(1,1).getValue().toString() + ")");
      }
      
    }
  }
  
  inventory.getRange(e.range.getRow(), 13, e.range.getRow(), 13).getCell(1,1).setValue(new Date()).setNumberFormat("MM/dd/yyyy hh:mm:ss");
  
  Logger.log(selectionChoices);
  requestSelection.setChoices(
    selectionChoices
    );
  inventoryReturn.setChoices(selectionChoices.map(function (choice){
    var c = choice.getValue();
    var numStart = c.indexOf("(");
    var numEnd = c.indexOf(")");
    return inventoryReturn.createChoice(c.substring(0, c.length - 2 - (numEnd - numStart)));
  }));
 
}
