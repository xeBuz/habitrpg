'use strict';

describe('Inventory Controller', function() {
  var scope, ctrl, user, rootScope;

  beforeEach(function() {
    module(function($provide) {
      $provide.value('User', {});
    });

    inject(function($rootScope, $controller, Shared){
      user = specHelper.newUser({
        balance: 4,
        items: {
          gear: { owned: {} },
          eggs: { Cactus: 1 },
          hatchingPotions: { Base: 1 },
          food: { Meat: 1 },
          pets: {},
          mounts: {}
        }
      });

      Shared.wrap(user);
      var mockWindow = {
        confirm: function(msg){
          return true;
        }
      };
      scope = $rootScope.$new();
      rootScope = $rootScope;

      // Load RootCtrl to ensure shared behaviors are loaded
      $controller('RootCtrl',  {$scope: scope, User: {user: user}, $window: mockWindow});

      ctrl = $controller('InventoryCtrl', {$scope: scope, User: {user: user}, $window: mockWindow});
    });
  });

  it('starts without any item selected', function(){
    expect(scope.selectedEgg).to.eql(null);
    expect(scope.selectedPotion).to.eql(null);
    expect(scope.selectedFood).to.eql(undefined);
  });

  it('chooses an egg', function(){
    scope.chooseEgg('Cactus');
    expect(scope.selectedEgg.key).to.eql('Cactus');
  });

  it('chooses a potion', function(){
    scope.choosePotion('Base');
    expect(scope.selectedPotion.key).to.eql('Base');
  });

  it('hatches a pet', function(){
    scope.chooseEgg('Cactus');
    scope.choosePotion('Base');
    expect(user.items.eggs).to.eql({Cactus: 0});
    expect(user.items.hatchingPotions).to.eql({Base: 0});
    expect(user.items.pets).to.eql({'Cactus-Base': 5});
    expect(scope.selectedEgg).to.eql(null);
    expect(scope.selectedPotion).to.eql(null);
  });

  it('sells an egg', function(){
    scope.chooseEgg('Cactus');
    scope.sellInventory();
    expect(user.items.eggs).to.eql({Cactus: 0});
    expect(user.stats.gp).to.eql(3);
  });

  it('sells a potion', function(){
    scope.choosePotion('Base');
    scope.sellInventory();
    expect(user.items.hatchingPotions).to.eql({Base: 0});
    expect(user.stats.gp).to.eql(2);
  });

  it('sells food', function(){
    scope.chooseFood('Meat');
    scope.sellInventory();
    expect(user.items.food).to.eql({Meat: 0});
    expect(user.stats.gp).to.eql(1);
  });

  it('chooses a pet', function(){
    user.items.pets['Cactus-Base'] = 5;
    scope.choosePet('Cactus', 'Base');
    expect(user.items.currentPet).to.eql('Cactus-Base');
  });

  it('purchases an egg', inject(function(Content){
    scope.purchase('eggs', Content.eggs['Wolf']);
    expect(user.balance).to.eql(3.25);
    expect(user.items.eggs).to.eql({Cactus: 1, Wolf: 1})
  }));

  describe('Deselecting Items', function() {
    it('deselects a food', function(){
      scope.chooseFood('Meat');
      scope.deselectItem();
      expect(scope.selectedFood).to.eql(null);
    });

    it('deselects a potion', function(){
      scope.choosePotion('Base');
      scope.deselectItem();
      expect(scope.selectedPotion).to.eql(null);
    });

    it('deselects a egg', function(){
      scope.chooseEgg('Cactus');
      scope.deselectItem();
      expect(scope.selectedEgg).to.eql(null);
    });
  });

  describe('openCardsModal', function(type, numberOfVariations) {
    var cardsModalScope;

    beforeEach(function() {
      cardsModalScope = {};
      sandbox.stub(rootScope, 'openModal');
      sandbox.stub(rootScope, '$new').returns(cardsModalScope);
    });

    it('opens cards modal', function() {
      scope.openCardsModal('valentine', 4);

      expect(rootScope.openModal).to.be.calledOnce;
      expect(rootScope.openModal).to.be.calledWith(
        'cards'
      );
    });

    it('instantiates a new scope for the modal', function() {
      scope.openCardsModal('valentine', 4);

      expect(rootScope.$new).to.be.calledOnce;
      expect(cardsModalScope.cardType).to.eql('valentine');
      expect(cardsModalScope.cardMessage).to.exist;
    });

    it('provides a card message', function() {
      scope.openCardsModal('valentine', 1);

      expect(cardsModalScope.cardMessage).to.eql(env.t('valentine0'));
    });

    it('randomly generates message from x number of messages', function() {
      var possibleValues = [env.t('valentine0'), env.t('valentine1')];

      scope.openCardsModal('valentine', 2);

      expect(possibleValues).to.contain(cardsModalScope.cardMessage);
    });
  });

  describe('#buyQuest', function() {
    var quests, questObject;

    beforeEach(inject(function(Quests) {
      quests = Quests;
      questObject = { key: 'whale' };

      sandbox.stub(quests, 'buyQuest').returns({ then: function(res) { res(questObject); } });
    }));

    it('calls Quests.buyQuest', function() {
      scope.buyQuest('foo');

      expect(quests.buyQuest).to.be.calledOnce;
      expect(quests.buyQuest).to.be.calledWith('foo');
    });

    it('sets selectedQuest to resolved quest object', function() {
      scope.buyQuest('whale');

      expect(rootScope.selectedQuest).to.eql(questObject);
    });

    it('opens buyQuest modal', function() {
      sandbox.spy(rootScope, 'openModal');

      scope.buyQuest('whale');

      expect(rootScope.openModal).to.be.calledOnce;
      expect(rootScope.openModal).to.be.calledWith('buyQuest', {controller: 'InventoryCtrl'});
    });
  });

  describe('#showQuest', function() {
    var quests, questObject;

    beforeEach(inject(function(Quests) {
      quests = Quests;
      questObject = { key: 'whale' };

      sandbox.stub(quests, 'showQuest').returns({ then: function(res) { res(questObject); } });
    }));

    it('calls Quests.showQuest', function() {
      scope.showQuest('foo');

      expect(quests.showQuest).to.be.calledOnce;
      expect(quests.showQuest).to.be.calledWith('foo');
    });

    it('sets selectedQuest to resolved quest object', function() {
      scope.showQuest('whale');

      expect(rootScope.selectedQuest).to.eql(questObject);
    });

    it('opens showQuest modal', function() {
      sandbox.spy(rootScope, 'openModal');

      scope.showQuest('whale');

      expect(rootScope.openModal).to.be.calledOnce;
      expect(rootScope.openModal).to.be.calledWith('showQuest', {controller: 'InventoryCtrl'});
    });
  });

  describe('#hasAllTimeTravelerItems', function() {
    it('returns false if items remain for purchase with Mystic Hourglasses', function() {
      expect(scope.hasAllTimeTravelerItems()).to.eql(false);
    });

    it('returns true if there are no items left to purchase', inject(function(Content) {
      for (var item in Content.gear.flat) {
        if (item.indexOf('mystery') > -1) {
          user.items.gear.owned[item] = true;
        }
      }
      for (var pet in Content.timeTravelStable.pets) {
        user.items.pets[pet] = 5;
      }
      for (var mount in Content.timeTravelStable.mounts) {
        user.items.mounts[mount] = true;
      }
      
      expect(scope.hasAllTimeTravelerItems()).to.eql(true);
    }));
  });

  describe('#hasAllTimeTravelerItemsOfType', function() {
    it('returns false for Mystery Sets if there are sets left in the time traveler store', function() {
      expect(scope.hasAllTimeTravelerItemsOfType('mystery')).to.eql(false);
    });

    it('returns true for Mystery Sets if there are no sets left to purchase', inject(function(Content) {
      for (var item in Content.gear.flat) {
        if (item.indexOf('mystery') > -1) {
          user.items.gear.owned[item] = true;
        }
      }

      expect(scope.hasAllTimeTravelerItemsOfType('mystery')).to.eql(true);
    }));

    it('returns false for pets if user does not own all pets in the Time Travel Stable', function() {
      expect(scope.hasAllTimeTravelerItemsOfType('pets')).to.eql(false); 
    });

    it('returns true for pets if user owns all pets in the Time Travel Stable', inject(function(Content) {
      for (var pet in Content.timeTravelStable.pets) {
        user.items.pets[pet] = 5;
      }

      expect(scope.hasAllTimeTravelerItemsOfType('pets')).to.eql(true); 
    }));

    it('returns false for mounts if user does not own all mounts in the Time Travel Stable', function() {
      expect(scope.hasAllTimeTravelerItemsOfType('mounts')).to.eql(false); 
    });

    it('returns true for mounts if user owns all mounts in the Time Travel Stable', inject(function(Content) {
      for (var mount in Content.timeTravelStable.mounts) {
        user.items.mounts[mount] = true;
      }

      expect(scope.hasAllTimeTravelerItemsOfType('mounts')).to.eql(true); 
    }));
  });
});
