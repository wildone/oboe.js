describe('patternAdapter', function() {
  
   it('compiles the correct pattern when patterns are listened to', function(){
   
      bus('newListener').emit( 'node:test_pattern');
            
      expect( jsonPathCompiler ).toHaveBeenCalledWith('test_pattern');
   })

   it('listens for NODE_FOUND events when node:pattern is added', function(){
         
      bus('newListener').emit( 'node:test_pattern');
      
      expect(bus(NODE_FOUND).on)
         .toHaveBeenCalledWith(            
            jasmine.any(Function)
         ,  'node:test_pattern'
         )
   })
   
   it('does not listen for NODE_FOUND events second time same node:pattern is added', function(){
         
      bus('newListener').emit( 'node:test_pattern');
      bus('newListener').emit( 'node:test_pattern');
      
      expect(bus(NODE_FOUND).on.calls.length).toBe(1);
   })
           
   it('stops listening for node events when node:pattern is removed again', function(){
         
      bus('node:test_pattern').on( noop);
      bus('node:test_pattern').un( noop);
      
      expect(bus(NODE_FOUND).un)
         .toHaveBeenCalledWith(
            'node:test_pattern'
         )
   })
   
   it('starts listening again for node events when node:pattern is added, removed and added again', function(){
         
      bus('node:test_pattern').on( noop);
      
      expect(bus(NODE_FOUND).on.calls.length).toBe(1);
      
      bus('node:test_pattern').on( noop);
      
      expect(bus(NODE_FOUND).on.calls.length).toBe(1);                  
      
      bus('node:test_pattern').un( noop);
      
      expect(bus(NODE_FOUND).un.calls.length).toBe(0);
      
      bus('node:test_pattern').un( noop);
      
      expect(bus(NODE_FOUND).un.calls.length).toBe(1);                  
      
      bus('node:test_pattern').on( noop);      
      
      expect(bus(NODE_FOUND).on.calls.length).toBe(2);
   })   
   
   it('doesn\'t stop listening is there are still other node:pattern listeners', function(){
         
      bus('node:test_pattern').on( noop);
      bus('node:test_pattern').on( noop);
      bus('node:test_pattern').un( noop);
      
      expect(bus(NODE_FOUND).un)
         .not.toHaveBeenCalledWith(            
            'node:test_pattern'
         )
   })
   
   it('doesn\'t stop listening if a different pattern is unsubscribed from', function(){
         
      bus('node:test_pattern').on( noop);
      bus('node:other_test_pattern').on( noop);
      bus('node:other_test_pattern').un( noop);
      
      expect(bus(NODE_FOUND).un)
         .not.toHaveBeenCalledWith(           
            'node:test_pattern'
         )
   })
   
   it('doesn\'t stop listening if wrong event type is unsubscribed', function(){
         
      bus('node:test_pattern').on( noop);
      bus('path:test_pattern').on( noop);
      bus('path:test_pattern').un( noop);
      
      expect(bus(NODE_FOUND).un)
         .not.toHaveBeenCalledWith(            
            'node:test_pattern'
         )
   })
   
   it('only listens once to NODE_FOUND when same pattern is added twice', function(){
         
      bus('node:test_pattern').on( noop);
      bus('node:test_pattern').on( noop);
      
      expect( listAsArray( bus(NODE_FOUND).listeners ).length ).toBe(1);
   })
   
   it('listens to NODE_FOUND and PATH_FOUND when given node: and path: listeners', function(){
         
      bus('node:test_pattern').on( noop);
      bus('path:test_pattern').on( noop);
      
      expect(bus(NODE_FOUND).on)
         .toHaveBeenCalledWith(            
            jasmine.any(Function)
         ,  'node:test_pattern'
         )
         
      expect(bus(PATH_FOUND).on)
         .toHaveBeenCalledWith(            
            jasmine.any(Function)
         ,  'path:test_pattern'
         )         
   })                     

   it('fires node:pattern events when match is found', function(){
      
      var ascent = anAscentMatching('test_pattern');
   
      bus('node:test_pattern').on( noop);

      bus(NODE_FOUND).emit( ascent);
      
      expect( bus('node:test_pattern').emit )
         .toHaveBeenCalledWith( 
            nodeOf( head( ascent ) )
         ,  ascent 
         );
   })   



// ----------- end of tests -----------

   var bus, matches, jsonPathCompiler;

   beforeEach(function(){
   
      matches = {};
   
      bus = spiedPubSub();
     
      jsonPathCompiler = jasmine.createSpy('jsonPathCompiler').andCallFake( 
         function (pattern){
   
            function compiled ( ascent ){         
               if( matches[pattern] === ascent ) {
                  return head(ascent);
               } else {
                  return false;
               }
            }
            
            return compiled;
         }
      );        
   
      patternAdapter(bus, jsonPathCompiler);      
   })   
   
   function anAscentMatching(pattern) {
      var ascent = list(namedNode('node', {}));

      matches[pattern] = ascent;  

      return ascent;
   }

});