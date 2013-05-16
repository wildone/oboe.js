(function(){
/*
   BDD-style test cases for the oboe progressive parser.
   
   Since the path matching is already separately tested
   and not stubbed, this isn't really a unit test here.

   Uses sinon.js for stubs

   Runs using JS Test Driver directly, or using the runtests.sh
   shell script.

 */

TestCase("oboeTest", {


   testHandlesEmptyObjectDetectedWithBang: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!')
         .whenGivenInput('{}')
         .thenTheParser(
            matched({}).atRootOfJson(),
            foundOneMatch
         );

   }
   
,  testHandlesEmptyObjectDetectedWithBangWhenExplicitlySelected: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('$!')
         .whenGivenInput('{}')
         .thenTheParser(
            matched({}).atRootOfJson(),
            foundOneMatch
         );

   }   
   
,  testGivesWindowAsContextWhenNothingGivenExplicitly: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!')
         .whenGivenInput('{}')
         .thenTheParser( calledbackWithContext(window) );
   }
   
,  testCallsOnGivenContext: function() {
      var myObject = { doSomething: function(){} };

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!', myObject.doSomething, myObject)
         .whenGivenInput('{}')
         .thenTheParser( calledbackWithContext(myObject) );
   }   

,  testFindOnlyFiresWhenHasWholeObject: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!')
         .whenGivenInput('{')
          .thenTheParser(
            foundNoMatches
          )
         .whenGivenInput('}')
         .thenTheParser(
            matched({}).atRootOfJson(),
            foundOneMatch
         );

   }

,  testListeningForPathFiresWhenRootObjectStarts: function() {

      // clarinet doesn't notify of matches to objects (onopenobject) until the
      // first key is found, that is why we don't just give '{' here as the partial
      // input.

      givenAParser()
         .andWeAreListeningForMatchesToPattern('!')
         .whenGivenInput('{"foo":')
          .thenTheParser(
            foundNMatches(1),
            matched({}).atRootOfJson()
          );
   }
   
,  testListeningForPathFiresWhenRootArrayStarts: function() {

      // clarinet doesn't notify of matches to objects (onopenobject) until the
      // first key is found, that is why we don't just give '{' here as the partial
      // input.

      givenAParser()
         .andWeAreListeningForMatchesToPattern('!')
         .whenGivenInput('[1') // the minimum string required for clarinet 
                               // to fire onopenarray. Won't fire with '['.
          .thenTheParser(
            foundNMatches(1),
            matched([]).atRootOfJson()
          );
   }
   
     
,  testHandlesEmptyObjectDetectedWithSingleStar: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('*')
         .whenGivenInput('{}')
         .thenTheParser(
            matched({}).atRootOfJson(),
            foundOneMatch
         );
   }
   
,  testDoesntDetectSpuriousPathOffEmptyObject: function() {

      givenAParser()
         .andWeAreListeningForMatchesToPattern('!.foo.*')
         .whenGivenInput( {foo:{}} )
         .thenTheParser(
            foundNoMatches
         );
   }   

,  testHandlesEmptyObjectDetectedWithDoubleDot: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('*')
         .whenGivenInput('{}')
         .thenTheParser(
            matched({}).atRootOfJson(),
            foundOneMatch
         );
   }

,  testNotifiesOfStringsWhenListenedTo: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.string')
         .whenGivenInput('{"string":"s"}')
         .thenTheParser(
            matched("s"),
            foundOneMatch
         );
   }
   
/*,  testAllowsMultiplePathsToBeListenedToInOneCall: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern(
          {
               'a':function(){}
          ,    'b':function(){}
          })
         .whenGivenInput({a:'A', b:'B'})
         .thenTheParser(
            matched("s"),
            foundOneMatch
         );
   } */   

,  testNotifiesOfPathForOfPropertyNameWithIncompleteJson: function() {

      givenAParser()
         .andWeAreListeningForMatchesToPattern('!.string')
         .whenGivenInput('{"string":')
         .thenTheParser(
            foundOneMatch
         );
   }

,  testNotifiesOfSecondPropertyNameWithIncompleteJson: function() {

      givenAParser()
         .andWeAreListeningForMatchesToPattern('!.pencils')
         .whenGivenInput('{"pens":4, "pencils":')
         .thenTheParser(
            // null because the parser hasn't been given the value yet
            matched(null).atPath(['pencils']),
            foundOneMatch
         );
   }

,  testNotifiesOfMultipleChildrenOfRoot: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.*')
         .whenGivenInput('{"a":"A","b":"B","c":"C"}')
         .thenTheParser(
             matched('A').atPath(['a'])
         ,   matched('B').atPath(['b'])
         ,   matched('C').atPath(['c'])
         ,   foundNMatches(3)
         );
   }
   
,  testNotifiesOfMultipleChildrenOfRootWhenSelectingTheRoot: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('$!.*')
         .whenGivenInput({"a":"A", "b":"B", "c":"C"})
         .thenTheParser(
            // rather than getting the fully formed objects, we should now see the root object
            // being grown step by step:
             matched({"a":"A"})
         ,   matched({"a":"A", "b":"B"})
         ,   matched({"a":"A", "b":"B", "c":"C"})
         ,   foundNMatches(3)
         );
   }   
   
,  testDoesNotNotifySpuriouslyOfFoundPath: function() {

      givenAParser()
         .andWeAreListeningForMatchesToPattern('!.a')
         .whenGivenInput([{a:'a'}])
         .thenTheParser(foundNoMatches);
   }
   
,  testDoesNotNotifySpuriouslyOfFoundObject: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.a')
         .whenGivenInput([{a:'a'}])
         .thenTheParser(foundNoMatches);
   }      

,  testNotifiesOfMultiplePropertiesOfAnObjectWithoutWaitingForEntireObject: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.*')
         .whenGivenInput('{"a":')
         .thenTheParser(
             foundNoMatches
          )
         .whenGivenInput('"A",')
         .thenTheParser(
             matched('A').atPath(['a'])
         ,   foundOneMatch
         )
         .whenGivenInput('"b":"B"}')
         .thenTheParser(
             matched('B').atPath(['b'])
         ,   foundNMatches(2)
         );
   }

,  testNotifiesOfNamedChildOfRoot: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.b')
         .whenGivenInput('{"a":"A","b":"B","c":"C"}')
         .thenTheParser(
             matched('B').atPath(['b'])
         ,   foundOneMatch
         );
   }

,  testNotifiesOfArrayElements: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.testArray.*')
         .whenGivenInput('{"testArray":["a","b","c"]}')
         .thenTheParser(
             matched('a').atPath(['testArray',0])
         ,   matched('b').atPath(['testArray',1])
         ,   matched('c').atPath(['testArray',2])
         ,   foundNMatches(3)
         );
   }

,  testNotifiesOfPathMatchWhenArrayStarts: function() {

      givenAParser()
         .andWeAreListeningForMatchesToPattern('!.testArray')
         .whenGivenInput('{"testArray":["a"')
         .thenTheParser(
             foundNMatches(1)
         ,   matched(null) // when path is matched, it is not known yet
                           // that it contains an array
         );
   }

,  testNotifiesOfPathMatchWhenSecondArrayStarts: function() {

      givenAParser()
         .andWeAreListeningForMatchesToPattern('!.array2')
         .whenGivenInput('{"array1":["a","b"], "array2":["a"')
         .thenTheParser(
            foundNMatches(1)
         ,  matched(null) // when path is matched, it is not known yet
                          // that it contains an array
         );
   }
   
,  testNotifiesOfPathsInsideArrays: function() {

      givenAParser()
         .andWeAreListeningForMatchesToPattern('![*]')
         .whenGivenInput( [{}, 'b', 2, []] )
         .thenTheParser(
            foundNMatches(4)
         );
   }
      
,  testCorrectlyGivesIndexWhenFindingObjectsInArray: function() {

      givenAParser()
         .andWeAreListeningForMatchesToPattern('![2]')
         .whenGivenInput( [{}, {}, 'this_one'] )
         .thenTheParser(
            foundNMatches(1)
         );
   }
      
,  testCorrectlyGivesIndexWhenFindingArraysInsideArray: function() {

      givenAParser()
         .andWeAreListeningForMatchesToPattern('![2]')
         .whenGivenInput( [[], [], 'this_one'] )
         .thenTheParser(
            foundNMatches(1)
         );
   }
   
,  testCorrectlyGivesIndexWhenFindingArraysInsideArraysEtc: function() {

      givenAParser()
         .andWeAreListeningForMatchesToPattern('![2][2]')
         .whenGivenInput( [   
                              [], 
                              [], 
                              [  
                                 [], 
                                 [], 
                                 ['this_array']
                              ]
                          ] )
         .thenTheParser(
            foundNMatches(1)
         );
   }   
   
,  testCorrectlyGivesIndexWhenFindingStringsInsideArray: function() {

      givenAParser()
         .andWeAreListeningForMatchesToPattern('![2]')
         .whenGivenInput( ['', '', 'this_one'] )
         .thenTheParser(
            foundNMatches(1)
         );
   }
   
,  testCorrectlyGivesIndexWhenFindingNumbersInsideArray: function() {

      givenAParser()
         .andWeAreListeningForMatchesToPattern('![2]')
         .whenGivenInput( [1, 1, 'this_one'] )
         .thenTheParser(
            foundNMatches(1)
         );
   }
   
,  testCorrectlyGivesIndexWhenFindingNullsInsideArray: function() {

      givenAParser()
         .andWeAreListeningForMatchesToPattern('![2]')
         .whenGivenInput( [null, null, 'this_one'] )
         .thenTheParser(
            foundNMatches(1)
         );
   }      
   
,  testNotifiesOfPathsInsideObjects: function() {

      givenAParser()
         .andWeAreListeningForMatchesToPattern('![*]')
         .whenGivenInput( {a:{}, b:'b', c:2, d:[]} )
         .thenTheParser(
            foundNMatches(4)
         );
   }      

,  testNotifiesOfArrayElementsSelectedByIndex: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.testArray[2]')
         .whenGivenInput('{"testArray":["a","b","this_one"]}')
         .thenTheParser(
             matched('this_one').atPath(['testArray',2])
         ,   foundOneMatch
         );
   }

,  testNotifiesNestedArrayElementsSelectedByIndex: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.testArray[2][2]')
         .whenGivenInput( {"testArray":
                              ["a","b",
                                 ["x","y","this_one"]
                              ]
                          }
                        )
         .thenTheParser(
             matched('this_one')
               .atPath(['testArray',2,2])
               .withParent( ["x","y","this_one"] )
               .withGrandparent( ["a","b", ["x","y","this_one"]] )
         ,   foundOneMatch
         );
   }
   
,  testCanNotifyNestedArrayElementsSelectedByIndexByPassingTheRootArray: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.$testArray[2][2]')
         .whenGivenInput( {"testArray":
                              ["a","b",
                                 ["x","y","this_one"]
                              ]
                          }
                        )
         .thenTheParser(
             matched(   ["a","b",
                           ["x","y","this_one"]
                        ])
         ,   foundOneMatch
         );
   }        

,  testNotifiesOfDeeplyNestedObjects: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('..')
         .whenGivenInput({"a":{"b":{"c":{"d":"e"}}}})
         .thenTheParser(
             matched('e')
               .atPath(['a', 'b', 'c', 'd'])
               .withParent({d:'e'})
         ,   matched({d:"e"})
               .atPath(['a', 'b', 'c'])
         ,   matched({c:{d:"e"}})
               .atPath(['a', 'b'])
         ,   matched({b:{c:{d:"e"}}})
               .atPath(['a'])
         ,   matched({a:{b:{c:{d:"e"}}}})
               .atRootOfJson()
         ,   foundNMatches(5)
         );
   }

,  testCanDetectInsideTheSecondObjectElementOfAnArray: function() {

      // this fails if we don't set the curKey to the length of the array
      // when we detect an object and and the parent of the object that ended
      // was an array

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!..find')
         .whenGivenInput(
            {
               array:[
                  {a:'A'}
               ,  {find:'should_find_this'}
               ]
            }
         )
         .thenTheParser(
             matched('should_find_this')
               .atPath(['array',1,'find'])
         );
   }

,  testDetectionIgnoresIfOnlyStartOfPatternMatches: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!..a')
         .whenGivenInput({
               ab:'should_not_find_this'
            ,  a0:'nor this'
            ,  a:'but_should_find_this'
            }
         )
         .thenTheParser(
            matched('but_should_find_this')
         ,  foundOneMatch
         );
   }

,  testDetectionIgnoresIfOnlyEndOfPatternMatches: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!..a')
         .whenGivenInput({
               aa:'should_not_find_this'
            ,  ba:'nor this'
            ,  a:'but_should_find_this'
            }
         )
         .thenTheParser(
            matched('but_should_find_this')
         ,  foundOneMatch
         );
   }

,  testDetectionIgnoresPartialPathMatchesInArrayIndices: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!..[1]')
         .whenGivenInput({
               array : [0,1,2,3,4,5,6,7,8,9,10,11,12]
            }
         )
         .thenTheParser(
            matched(1)
               .withParent([0,1])
         ,  foundOneMatch
         );
   }
   
,  testCanGiveAnArrayBackWhenJustPartiallyDone: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('$![5]')
         .whenGivenInput([0,1,2,3,4,5,6,7,8,9,10,11,12])
         .thenTheParser(
            matched([0,1,2,3,4,5])
         ,  foundOneMatch
         );
   }   
   
,  testGivesCorrectParentAndGrandparentForEveryItemOfAnArray: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.array.*')
         .whenGivenInput({
               array : ['a','b','c']
            }
         )
         .thenTheParser(
            matched('a')
               .withParent(['a'])
               .withGrandparent({array:['a']})
         ,  matched('b')
               .withParent(['a', 'b'])
               .withGrandparent({array:['a','b']})               
         ,  matched('c')
               .withParent(['a', 'b', 'c'])
               .withGrandparent({array:['a','b','c']})               
         );
   }
   
,  testGivesCorrectParentForEveryObjectItemOfAnArrayOfObjects: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.array.*')
         .whenGivenInput({
               array : [{'a':1},{'b':2},{'c':3}]
            }
         )
         .thenTheParser(
            matched({'a':1})
               .withParent([{'a':1}])
         ,  matched({'b':2})
               .withParent([{'a':1},{'b':2}])               
         ,  matched({'c':3})
               .withParent([{'a':1},{'b':2},{'c':3}])               
         );
   }
   
,  testGivesCorrectParentForObjectInAMixedArray: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.array.*')
         .whenGivenInput({
               array : [{'a':1},'b',{'c':3}, {}, ['d'], 'e']
            }
         )
         .thenTheParser(
            matched({'a':1})
               .withParent([{'a':1}])         
         );
   }
   
,  testGivesCorrectParentForStringInAMixedArray: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.array.*')
         .whenGivenInput({
               array : [{'a':1},'b',{'c':3}, {}, ['d'], 'e']
            }
         )
         .thenTheParser(
         
            matched('b')
               .withParent([{'a':1},'b'])
               
         );
   }
   
,  testGivesCorrectParentForSecondObjectInAMixedArray: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.array.*')
         .whenGivenInput({
               array : [{'a':1},'b',{'c':3}, {}, ['d'], 'e']
            }
         )
         .thenTheParser(
               
            matched({'c':3})
               .withParent([{'a':1},'b',{'c':3}])

         );
   }
   
,  testGivesCorrectParentForEmptyObjectInAMixedArray: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.array.*')
         .whenGivenInput({
               array : [{'a':1},'b',{'c':3}, {}, ['d'], 'e']
            }
         )
         .thenTheParser(
         
            matched({})
               .withParent([{'a':1},'b',{'c':3}, {}])
                                             
         );
   }
   
,  testGivesCorrectParentForSingletonStringArrayInAMixedArray: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.array.*')
         .whenGivenInput({
               array : [{'a':1},'b',{'c':3}, {}, ['d'], 'e']
            }
         )
         .thenTheParser(  
                                     
            matched(['d'])            
               .withParent([{'a':1},'b',{'c':3}, {}, ['d']])
               
         );
   }
   
,  testGivesCorrectParentForSingletonStringArrayInSingletonArray: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.array.*')
         .whenGivenInput({
               array : [['d']]
            }
         )
         .thenTheParser(  
                                     
            matched(['d'])            
               .withParent([['d']])
               
         );
   }   
      
,  testGivesCorrectParentForLastStringInAMixedArray: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.array.*')
         .whenGivenInput({
               array : [{'a':1},'b',{'c':3}, {}, ['d'], 'e']
            }
         )
         .thenTheParser(
         
            matched('e')
               .withParent([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
               
         );
   }   
   
     
,  testGivesCorrectParentForOpeningObjectInAMixedArrayAtRootOfJson: function() {
      // same test as above but without the object wrapper around the array:
      
      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.*')
         .whenGivenInput([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
         .thenTheParser(
         
            matched({'a':1})
               .withParent([{'a':1}])
               
         );
   }   
,  testGivesCorrectParentForStringInAMixedArrayAtRootOfJson: function() {
      // same test as above but without the object wrapper around the array:
      
      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.*')
         .whenGivenInput([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
         .thenTheParser(

            matched('b')
               .withParent([{'a':1},'b'])               

         );
   }   
,  testGivesCorrectParentForSecondObjectInAMixedArrayAtRootOfJson: function() {
      // same test as above but without the object wrapper around the array:
      
      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.*')
         .whenGivenInput([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
         .thenTheParser(
               
            matched({'c':3})
               .withParent([{'a':1},'b',{'c':3}])

         );
   }   
,  testGivesCorrectParentForEmptyObjectInAMixedArrayAtRootOfJson: function() {
      // same test as above but without the object wrapper around the array:
      
      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.*')
         .whenGivenInput([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
         .thenTheParser(

            matched({})
               .withParent([{'a':1},'b',{'c':3}, {}])                              

         );
   }   
,  testGivesCorrectParentForSingletonStringArrayInAMixedArrayAtRootOfJson: function() {
      // same test as above but without the object wrapper around the array:
      
      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.*')
         .whenGivenInput([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
         .thenTheParser(
                              
            matched(['d'])
               .withParent([{'a':1},'b',{'c':3}, {}, ['d']])

         );
   }
   
,  testGivesCorrectParentForSingletonStringArrayInASingletonArrayAtRootOfJson: function() {
      // non-mixed array, easier version:
      
      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.*')
         .whenGivenInput([['d']])
         .thenTheParser(
                              
            matched(['d'])
               .withParent([['d']])

         );
   }                        
   
,  testGivesCorrectParentForFinalStringInAMixedArrayAtRootOfJson: function() {
      // same test as above but without the object wrapper around the array:
      
      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!.*')
         .whenGivenInput([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
         .thenTheParser(

            matched('e')
               .withParent([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
         );
   }    

,  testCanDetectAtMultipleDepthsUsingDoubleDot: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!..find')
         .whenGivenInput({

            array:[
               {find:'first_find'}
            ,  {padding:{find:'second_find'}, find:'third_find'}
            ]
         ,  find: {
               find:'fourth_find'
            }

         })
         .thenTheParser(
             matched('first_find').atPath(['array',0,'find'])
         ,   matched('second_find').atPath(['array',1,'padding','find'])
         ,   matched('third_find').atPath(['array',1,'find'])
         ,   matched('fourth_find').atPath(['find','find'])
         ,   matched({find:'fourth_find'}).atPath(['find'])

         ,   foundNMatches(5)
         );
   }
   
,  testPassesAncestorsOfFoundObjectCorrectly: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!..find')
         .whenGivenInput({

            array:[
               {find:'first_find'}
            ,  {padding:{find:'second_find'}, find:'third_find'}
            ]
         ,  find: {
               find:'fourth_find'
            }

         })
         .thenTheParser(
             matched('first_find')
               .withParent( {find:'first_find'} )
               .withGrandparent( [{find:'first_find'}] )
               
         ,   matched('second_find')
               .withParent({find:'second_find'})
               .withGrandparent({padding:{find:'second_find'}})
               
         ,   matched('third_find')
              .withParent({padding:{find:'second_find'}, find:'third_find'})
              .withGrandparent([
                    {find:'first_find'}
                 ,  {padding:{find:'second_find'}, find:'third_find'}
                 ])                          
         );
   }   
   
,  testCanDetectAtMultipleDepthsUsingImpliedAncestorOfRootRelationship: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('find')
         .whenGivenInput({

            array:[
               {find:'first_find'}
            ,  {padding:{find:'second_find'}, find:'third_find'}
            ]
         ,  find: {
               find:'fourth_find'
            }

         })
         .thenTheParser(
             matched('first_find').atPath(['array',0,'find'])
         ,   matched('second_find').atPath(['array',1,'padding','find'])
         ,   matched('third_find').atPath(['array',1,'find'])
         ,   matched('fourth_find').atPath(['find','find'])
         ,   matched({find:'fourth_find'}).atPath(['find'])

         ,   foundNMatches(5)
         );
   }   

,  testMatchesNestedAdjacentSelector: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!..[0].colour')
         .whenGivenInput({

            foods: [
               {name:'aubergine', colour:'purple'},
               {name:'apple', colour:'red'},
               {name:'nuts', colour:'brown'}
            ],
            non_foods: [
               {name:'brick', colour:'red'},
               {name:'poison', colour:'pink'},
               {name:'broken_glass', colour:'green'}
            ]
         })
         .thenTheParser
               (   matched('purple')
               ,   matched('red')
               ,   foundNMatches(2)
               );
   }
      
,  testMatchesNestedSelectorSeparatedByASingleStarSelector: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('!..foods.*.name')
         .whenGivenInput({

            foods: [
               {name:'aubergine', colour:'purple'},
               {name:'apple', colour:'red'},
               {name:'nuts', colour:'brown'}
            ],
            non_foods: [
               {name:'brick', colour:'red'},
               {name:'poison', colour:'pink'},
               {name:'broken_glass', colour:'green'}
            ]
         })
         .thenTheParser
               (   matched('aubergine')
               ,   matched('apple')
               ,   matched('nuts')
               ,   foundNMatches(3)
               );
   }
   
,  testGetsAllSimpleObjectsFromAnArray: function() {

      // this test is similar to the following one, except it does not use ! in the pattern
      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('foods.*')
         .whenGivenInput({
            foods: [
               {name:'aubergine'},
               {name:'apple'},
               {name:'nuts'}
            ]
         })
         .thenTheParser
               (   foundNMatches(3)
               ,   matched({name:'aubergine'})
               ,   matched({name:'apple'})
               ,   matched({name:'nuts'})   
               );
   }   
   
,  testGetsSameObjectRepeatedlyUsingCss4Syntax: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern('$foods.*')
         .whenGivenInput({        
            foods: [
               {name:'aubergine'},
               {name:'apple'},
               {name:'nuts'}
            ]
         })
         // essentially, the parser should have been called three times with the same object, but each time
         // an additional item should have been added
         .thenTheParser
               (   foundNMatches(3)
               ,   matched([{name:'aubergine'}])
               ,   matched([{name:'aubergine'},{name:'apple'}])
               ,   matched([{name:'aubergine'},{name:'apple'},{name:'nuts'}])   
               );
   }   

,  testMatchesNestedSelectorSeparatedByDoubleDot: function() {

      givenAParser()
         // we just want the French names of foods:
         .andWeAreListeningForThingsFoundAtPattern('!..foods..fr')
         .whenGivenInput({

            foods: [
               {name:{en:'aubergine', fr:'aubergine'}, colour:'purple'},
               {name:{en:'apple', fr:'pomme'}, colour:'red'},
               {name:{en:'nuts', fr:'noix'}, colour:'brown'}
            ],
            non_foods: [
               {name:{en:'brick'}, colour:'red'},
               {name:{en:'poison'}, colour:'pink'},
               {name:{en:'broken_glass'}, colour:'green'}
            ]
         })
         .thenTheParser
               (   matched('aubergine')
               ,   matched('pomme')
               ,   matched('noix')
               ,   foundNMatches(3)
               );
   }

   
,  testErrorsOnJsonWithUnquotedKeys: function() {
  
      givenAParser()
        .andWeAreExpectingSomeErrors()
        .whenGivenInput('{invalid:"json"}') // key not quoted, invalid json
        .thenTheParser
           (   calledCallbackOnce
           ,   wasPassedAnErrorObject
           );
   }
   
,  testErrorsOnMalformedJson: function() {
  
      givenAParser()
        .andWeAreExpectingSomeErrors()
        .whenGivenInput('{{') // invalid!
        .thenTheParser
           (   calledCallbackOnce
           ,   wasPassedAnErrorObject
           );
   }
   
,  testCallsErrorListenerIfCallbackErrors: function() {
  
      givenAParser()
        .andWeHaveAFaultyCallbackListeningFor('!') // just want the root object
        .andWeAreExpectingSomeErrors()
        .whenGivenInput('{}') // valid json, should provide callback
        .thenTheParser
           (   calledCallbackOnce
           ,   wasPassedAnErrorObject
           );
   }      
   
      
});


function givenAParser() {

   function Asserter() {

      var oboeParser = oboe.parser(),

          expectingErrors = false,

          spiedCallback; //erk: only one callback stub per Asserter right now :-s
          
      oboeParser.onError(function(e) {
         // Unless stated, the test isn't expecting errors. Fail the test on error: 
         if(!expectingErrors){ 
            fail('unexpected error: ' + e);
         }
      });


      /** sinon stub is only really used to record arguments given.
       *  However, we want to preserve the arguments given at the time of calling, because they might subsequently
       *  be changed inside the parser so everything gets cloned before going to the stub 
       */
      function argumentClone(delegateCallback) {
         return function(){
         
            function clone(original){
               return JSON.parse( JSON.stringify( original ) );
            }
            function toArray(args) {
               return Array.prototype.slice.call(args);
            }
            
            var cloneArguments = toArray(arguments).map(clone);
            
            delegateCallback.apply( this, cloneArguments );
         };
      }

      this.andWeAreListeningForThingsFoundAtPattern = function(pattern, callback, scope) {
         spiedCallback = callback ? sinon.stub() : sinon.spy(callback);
      
         oboeParser.onFind(pattern, argumentClone(spiedCallback), scope);
         return this;
      };

      this.andWeAreListeningForMatchesToPattern = function(pattern, callback, scope) {
         spiedCallback = callback ? sinon.stub() : sinon.spy(callback);      
      
         oboeParser.onPath(pattern, argumentClone(spiedCallback), scope);
         return this;
      };
      
      this.andWeHaveAFaultyCallbackListeningFor = function(pattern) {
         spiedCallback = sinon.stub().throws();      
      
         oboeParser.onPath(pattern, argumentClone(spiedCallback));
         return this;
      };      
      
      this.andWeAreExpectingSomeErrors = function() {
         expectingErrors = true;
      
         spiedCallback = sinon.stub();
         
         oboeParser.onError(argumentClone(spiedCallback));
         return this;
      };
                 
      this.whenGivenInput = function(json) {
         if( typeof json != 'string' ) {
            json = JSON.stringify(json);
         }

         oboeParser.read(json);
         return this;
      };

      /**
       * Assert any number of conditions were met on the spied callback
       */
      this.thenTheParser = function( /* ... functions ... */ ){
         for (var i = 0; i < arguments.length; i++) {
            var assertion = arguments[i];
            assertion.testAgainst(spiedCallback);
         }

         return this;
      }
   }
   return new Asserter();
}


var wasPassedAnErrorObject = {
   testAgainst: function failIfNotPassedAnError(callback) {
   
      if( !callback.args[0][0] instanceof Error ) {
         fail("Callback should have been given an error but was given" + callback.constructor.name);
      }
      
   }
};


// higher-level function to create assertions. Pass output to Asserter#thenTheParser.
// test how many matches were found
function foundNMatches(n){
   return {
      testAgainst:
      function(callback) {
         if( n != callback.callCount ) {
            fail('expected to have been called ' + n + ' times but has been called ' +
               callback.callCount + ' times. \n' +
                   "all calls were with:" +
                   reportArgumentsToCallback(callback.args)
            )
         }
      }
   }
}

var foundOneMatch = foundNMatches(1),
    calledCallbackOnce = foundNMatches(1),    
    foundNoMatches = foundNMatches(0);

function calledbackWithContext(callbackScope) {
   return { 
      testAgainst:
      function(callbackStub) {
         if(!callbackStub.calledOn(callbackScope)){
            fail('was not called in the expected context. Expected ' + callbackScope + ' but got ' + 
               callbackStub.getCall(0).thisValue);
         }   
      }
   };
}

function lastOf(array){
   return array[array.length-1];
}
function penultimateOf(array){
   return array[array.length-2];
}

/**
 * Make a string version of the callback arguments given from oboe
 * @param {[[*]]} callbackArgs
 */
function reportArgumentsToCallback(callbackArgs) {

   return "\n" + callbackArgs.map( function( args, i ){

      var ancestors = args[2];
      
      return "Call number " + i + " was: \n" + 
               "\tnode:         " + JSON.stringify( args[0] ) + "\n" + 
               "\tpath:         " + JSON.stringify( args[1] ) + "\n" +
               "\tparent:       " + JSON.stringify( lastOf(ancestors) ) + "\n" +
               "\tgrandparent:  " + JSON.stringify( penultimateOf(ancestors) ) + "\n" +
               "\tancestors:    " + JSON.stringify( ancestors );
   
   }).join("\n\n");
         
}

// higher-level function to create assertions which will be used by the asserter.
function matched(obj) {

   return {   
      testAgainst: function assertMatchedRightObject( callbackStub ) {
      
         if(!callbackStub.calledWith(obj)) {
   
            fail( "was not called with the object " +  JSON.stringify(obj) + "\n" +
                "objects that I got are:" +
                JSON.stringify(callbackStub.args.map(function(callArgs){return callArgs[0]}) ) + "\n" +
                "all calls were with:" +
                reportArgumentsToCallback(callbackStub.args));
   
         }
      }
   
   ,  atPath: function assertAtRightPath(path) {
         var oldAssertion = this.testAgainst;
         
         this.testAgainst = function( callbackStub ){
            oldAssertion.apply(this, arguments);
            
            if(!callbackStub.calledWithMatch(sinon.match.any, path)) {
               fail( "was not called with the path " +  JSON.stringify(path) + "\n" +
                   "paths that I have are:\n" +
                   callbackStub.args.map(function(callArgs){
                     return "\t" + JSON.stringify(callArgs[1]) + "\n";
                   }) + "\n" +
                   "all calls were with:" +
                   reportArgumentsToCallback(callbackStub.args));
            }            
         };
         
         return this;   
      }
      
   ,  withParent: function( parentObject ) {
         var oldAssertion = this.testAgainst;
         
         this.testAgainst = function( callbackStub ){
            oldAssertion.apply(this, arguments);
            
            var parentMatcher = sinon.match(function (array) {
                try{
                  assertEquals( parentObject, lastOf(array) );
                } catch(_e){
                  return false;
                }
                return true;
            }, "had the right parent");
            
            if(!callbackStub.calledWithMatch(obj, sinon.match.any, parentMatcher)) {
               fail( "was not called with the object" + JSON.stringify(obj) + 
                        " and parent object " +  JSON.stringify(parentObject) +
                        "all calls were with:" +
                        reportArgumentsToCallback(callbackStub.args));
            }            
         };
         
         return this;
      }
      
   ,  withGrandparent: function( grandparentObject ) {
         var oldAssertion = this.testAgainst;
         
         this.testAgainst = function( callbackStub ){
            oldAssertion.apply(this, arguments);
            
            var parentMatcher = sinon.match(function (array) {
                try{
                  assertEquals( grandparentObject, penultimateOf(array) );
                } catch(_e){
                  return false;
                }
                return true;
            }, "had the right grandparent");
            
            if(!callbackStub.calledWithMatch(obj, sinon.match.any, parentMatcher)) {
               fail( "was not called with the object" + JSON.stringify(obj) + 
                        " and garndparent object " +  JSON.stringify(grandparentObject) +
                        "all calls were with:" +
                        reportArgumentsToCallback(callbackStub.args));
            }            
         };
         
         return this;
      }                  
      
   ,  atRootOfJson: function assertAtRootOfJson() {
         this.atPath([]);
         return this;
      }
   };
}

})();