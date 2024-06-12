// getDescription returns description for Yellowstone compilation slide
function getDescription(path) {
  var result = "";

  // path is of format "*/dir/file.jpg"
  // dir is of format "20nn*"
  // file is of format "nnn_picture-description"

  // Process valid paths (must have directory separator and .jpg extension)
  path = decodeURI(path);
  var index = path.lastIndexOf('/');
  if (index >= 0 && path.lastIndexOf('.jpg') > index) {
    var file = path.substring(index + 1, path.lastIndexOf('.'));

    // File begins with "nnn_" for slides
    if (file.match(/^[0-9]{3}_/)) {
      if (file.match(/^[0-9]{3}_[C-Z]{1}[0-9]{7}/)) {
        // Found digital camera picture name ("nnn_Annnnnnn")
        result = file.substring(4, 12);
      } else if (file.match(/^[0-9]{3}_[A-B]{1}[0-9]{3}-[0-9]{2}/)) {
        // Found film camera picture name ("nnn_Annn-nn")
        result = file.substring(4, 11);
      } else if (file.match(/^[0-9]{3}_[0-9]{8}T[0-9]{6}/)) {
        // Found cell phone camera picture name ("nnn_nnnnnnnnTnnnnnn")
        result = file.substring(4, 12) + file.substring(13, 19);
      }

      // Continue processing if recognized picture name
      if (result.length > 0) {
        // Handle description if present
        index = file.indexOf('-', result.length + 4);
        if (index >= 0) {
          // Picture description is everything after "-"
          var desc = file.substring(index + 1);

          // Remove "*Yellowstone National Park" from description
          index = desc.indexOf("_in_Yellowstone_National_Park");
          if (index >= 0) {
            desc = desc.substring(0, index);
          } else {
            index = desc.indexOf("Yellowstone_National_Park");
            if (index >= 0) {
              desc = desc.substring(0, index);
            }
          }

          // Process description if one exists
          if (desc.length > 0) {
            // Replace underscores with spaces
            result = result + " - " + desc.replace(/_/g, ' ');

            // Replace special characters ("[*]") with HTML entity names ("&*;")
            index = file.indexOf('[');
            if (index >= 0 && index < file.indexOf(']')) {
              result = result.replace(/\[/g, '&');
              result = result.replace(/\]/g, ';');
            }
          }
        }
      }
    }

    // Append trip year if valid dir format
    var dir = path.match(/\/[0-9]{4}(-[0-9]{2})?[A-Z]*\//gi);
    if (dir != null) {
      if (dir[0].lastIndexOf('-') >= 5 && dir[0].length >= 8) {
        result = result + " (" + dir[0].substring(1,8) + ")";
      } else if (dir[0].length >= 5) {
        result = result + " (" + dir[0].substring(1,5) + ")";
      }
    }
  }

  // Display space to occupy slideName span if description empty
  if (result.length == 0) {
    result = "&nbsp;";
  }

  return result;
}
