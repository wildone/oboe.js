/**
 * This file declares some constants to use as names for event types.
 */

var // the events which are never exported are kept as 
    // the smallest possible representation, in numbers:
    _S = 1,

    // fired whenever a node is found in the JSON:
    NODE_FOUND    = _S++,
    // fired whenever a path is found in the JSON:      
    PATH_FOUND    = _S++,   
    
    NODE_MATCHED  = 'node',
    PATH_MATCHED  = 'path',
         
    FAIL_EVENT    = 'fail',    
    ROOT_FOUND    = _S++,    
    HTTP_START    = 'start',
    STREAM_DATA   = _S++,
    STREAM_END    = _S++,
    ABORTING      = _S++;
    
function errorReport(statusCode, body, error) {
   try{
      var jsonBody = JSON.parse(body);
   }catch(e){}

   return {
      statusCode:statusCode,
      body:body,
      jsonBody:jsonBody,
      thrown:error
   };
}    