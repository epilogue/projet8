/*gobal app, jasmine, describe, it, beforeEach, expect */

/**
 * fichier qui va permettre de créer les tests pour le fichier  controller.js 
 * utilisation du framework de test open source jasmine en version 2.99.0
 */

/**
 * bloc describ qui décrit ce qui va être tester au niveau du fichier controller
 * 
 */

describe('controller', function () {
	'use strict';

	var subject, model, view;
        /**
         * fonction setUpModel qui reçoit en paramètre des todos
         * elle appelle des simulations des différentes fonctions présentes dans le fichier controller.js
         * @param {type} todos
         */
	var setUpModel = function (todos) {
            /*simulation de la fonction model.prototype.read*/
		model.read.and.callFake(function (query, callback) {
			callback = callback || query;
			callback(todos);
		});
            /*simulation de la fonction model.prototype.getCount*/    
		model.getCount.and.callFake(function (callback) {

			var todoCounts = {
				active: todos.filter(function (todo) {
					return !todo.completed;
				}).length,
				completed: todos.filter(function (todo) {
					return !!todo.completed;
				}).length,
				total: todos.length
			};

			callback(todoCounts);
		});
                 /*simulation de la fonction model.prototype.remove*/  
		model.remove.and.callFake(function (id, callback) {
			callback();
		});
                /*simulation de la fonction model.prototype.create*/  
		model.create.and.callFake(function (title, callback) {
			callback();
		});
                /*simulation de la fonction model.prototype.update*/  
		model.update.and.callFake(function (id, updateData, callback) {
			callback();
		});
	};
        /**
         * fonction qui crée des 'espions  sur les evenements
         * 
         */
	var createViewStub = function () {
		var eventRegistry = {};
		return {
			render: jasmine.createSpy('render'),
			bind: function (event, handler) {
				eventRegistry[event] = handler;
			},
			trigger: function (event, parameter) {
				eventRegistry[event](parameter);
			}
		};
	};

        /**
         * fonction qui est appelée une fois avant chaque describe dans laquelle elle est appelée
         * elle crée des espions  pour toute les méthodes de la fonction model
         *
         */
	beforeEach(function () {
		model = jasmine.createSpyObj('model', ['read', 'getCount', 'remove', 'create', 'update']);
		view = createViewStub();
		subject = new app.Controller(model, view);
	});
        /**
         * spécification du test : should show entries on start-up
         * 
         */
	it('should show entries on start-up', function () { 
                /* doit afficher les entrées au démarrage
                 *  c'est à dire à la premiere utilisation de todo
                 *   donc liste de todo vide vérification que la vue se charge bien même avec une liste vide
                 *   test qui échoue : avec var todo = {title:'my todo'}, setUpModel([])*/ 
			setUpModel([]);

			subject.setView('');

			expect(view.render).toHaveBeenCalledWith('showEntries', []);
	});
        /**
         * suite de test  pour les routes 
         * 
         */
	describe('routing', function () {
                /**
                 * spécification du test :should show all entries without a route
                 *
                 */
		it('should show all entries without a route', function () {
			var todo = {title: 'my todo'};
			setUpModel([todo]);

			subject.setView('');

			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});
                /**
                 * spécification du test :should show all entries without "all" route
                 *
                 */
		it('should show all entries without "all" route', function () {
			var todo = {title: 'my todo'};
			setUpModel([todo]);

			subject.setView('#/');

			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});
                 /**
                 * spécification du test :should show active entries
                 *
                 */
		it('should show active entries', function () { 
                        /* HB_26_12_2020 doit afficher toutes les taches actives donc paramètre completed à false */
                        /* 1 on écrit un test qui échoue  donc avec completed à true
                         * puisque sa route sera #/completed  et que l'on cherche toutes les entrées avec la route #/active*/
                        /*2 après vérification que le test a bien échoué  
                         * on peut instancier la variable todo  avec la bonne valeur pour le paramètre completed*/
                        /*instanciation de la variable todo */
                        var todo = {completed:false};
                        setUpModel([todo]);
                        
                        subject.setView('#/active');
                       
                        expect(view.render).toHaveBeenCalledWith('showEntries', [{completed:false}]);
                        
		});
                 /**
                 * spécification du test :should show completed entries
                 *
                 */
		it('should show completed entries', function () { 
                         /* HB_26_12_2020 doit afficher toutes les taches completed donc paramètre completed à true
                          * test qui échoue avec le paramètre completed à false c'est à dire que la tache  n'est pas terminée */
                        var todo = {completed:true};
                        setUpModel([todo]);
                        
                        subject.setView('#/completed');
                       
                        expect(view.render).toHaveBeenCalledWith('showEntries', [{completed:true}]);
		});
	});
        /**
         * spécification du test :should show the content block when todos exists
         * 
         */
	it('should show the content block when todos exists', function () {
		setUpModel([{title: 'my todo', completed: true}]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('contentBlockVisibility', {
			visible: true
		});
	});
        /**
         * spécification du test :should hide the content block when no todos exists
         * 
         */
	it('should hide the content block when no todos exists', function () {
		setUpModel([]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('contentBlockVisibility', {
			visible: false
		});
	});
        /**
         * spécification du test :should check the toggle all button, if all todos are completed
         *
         */
        
	it('should check the toggle all button, if all todos are completed', function () {
		setUpModel([{title: 'my todo', completed: true}]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('toggleAll', {
			checked: true
		});
	});
        /**
         * spécification du test :should set the "clear completed" button
         * 
         */
	it('should set the "clear completed" button', function () {
		var todo = {id: 42, title: 'my todo', completed: true};
		setUpModel([todo]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('clearCompletedButton', {
			completed: 1,
			visible: true
		});
	});
        /**
         * spécification du test :should highlight "All" filter by default
         * 
         */
	it('should highlight "All" filter by default', function () {
                 /* HB 26_12_2020 teste si le bouton all est activé par défaut
                  * test échoué en mettant une route  completed  ou active */
                setUpModel([]);
                subject.setView('');
                expect(view.render).toHaveBeenCalledWith( 'setFilter','');
	});
        /**
         * spécification du test :should highlight "Active" filter when switching to active view
         * 
         */
	it('should highlight "Active" filter when switching to active view', function () {
                /* HB_26_12_2020 teste que le bouton active est bien activé lorsqu'on est sur la vue active 
                 * test qui échoue avec le setView à completed ou vide */
                setUpModel([]);
                subject.setView('#/active');
                expect(view.render).toHaveBeenCalledWith( 'setFilter','active');
	});
        /**
         * suite de test  pour les toggle All
         * 
         */
	describe('toggle all', function () {
                /**
                 * spécification du test :should highlight "Active" should toggle all todos to completed
                 * 
                 */
		it('should toggle all todos to completed', function () {
                        /* HB_26_12_2020 doit mettre toutes les taches a completed
                         * créer deux taches donc paramètre completed à false
                         * vérifier que le model lise bien les 2 taches en completed false
                         * lancer le trigger toggleAll  pour modifier le paramètre completed à true pour les 2 taches
                         * vérifier que le model  met bien à jour les deux taches avec  le paramètre completed à true 
                         * test qui échoue vérification du model avec completed false
                         * */
                        /*initialisation des deux taches*/
                        var todos = [{id:123456,title:'tache1',completed:false},
                            {id:234561,title:'tache2',completed:false}];
                        setUpModel(todos);
                        subject.setView('');
                        view.trigger('toggleAll',{completed:true});
                        /* vérification que le model lit bien les taches avec completed à false
                         * test qui échoue avec completed à true*/
                        expect(model.read).toHaveBeenCalledWith({completed: false}, jasmine.any(Function));
                        /*test qui echoue avec completed :false, false pour le premier et true pour le deuxième, true  pour le premier et false pour le deuxieme*/
                        expect(model.update).toHaveBeenCalledWith(123456,{completed: true}, jasmine.any(Function));
                        expect(model.update).toHaveBeenCalledWith(234561,{completed: true}, jasmine.any(Function));
		});
                /**
                 * spécification du test :should update the view
                 * 
                 */
		it('should update the view', function () {
                        /* HB_26_12_2020 test si la vue se met à jour quand on clique sur l'élément toogle all 
                         * on crée une tache dont le paramètre completed sera à true
                         * référence à la fonction toggleComplete
                         * test échoué completed true  dans expect  */
                         var todo = {id:345612,title:'tache1',completed:true};
                        setUpModel([todo]);
                        subject.setView('');
                        view.trigger('itemToggle',{id:345612,completed:false});
                        expect(view.render).toHaveBeenCalledWith('elementComplete', {id:345612,completed:false});
		});
                /**
                 * spécification du test :should toggle all todos to active
                 * 
                 */
                it('should toggle all todos to active',function(){
			/*creation de deux taches*/
			var todos = [{id:341256,title:'tache6',completed:true},
					{id:342156,title:'tache7',completed:true}];
				setUpModel(todos);
				subject.setView('');
			   view.trigger('toggleAll',{completed:false});
				/* vérification que le model lit bien les taches avec completed à true
				 * test qui échoue avec completed à false*/
				expect(model.read).toHaveBeenCalledWith({completed:true}, jasmine.any(Function));
				
				/*test qui echoue avec completed :true, false pour le premier et true pour le deuxième,
				 true  pour le premier et false pour le deuxieme*/
				expect(model.update).toHaveBeenCalledWith(341256,{completed: false}, jasmine.any(Function));
				expect(model.update).toHaveBeenCalledWith(342156,{completed: false}, jasmine.any(Function));
		});
	});
        /**
         * suite de test pour les nouvelles todos
         *
         */
	describe('new todo', function () {
                /**
                 * spécification du test :should add a new todo to the model
                 * 
                 */
		it('should add a new todo to the model', function () {
                        /* HB_26_12_2020 vérifie que l'on ajoute une nouvelle tache au model*/
                        setUpModel([]);

                      subject.setView('');

                      // Crée une nouvelle tache avec pour titre 'a new todo'
                      view.trigger('newTodo', 'une nouvelle tache');

                      // Vérifie que cette tache a bien été traitée par le model
                      expect(model.create).toHaveBeenCalledWith('une nouvelle tache', jasmine.any(Function));
		});
                 /**
                 * spécification du test :should add a new todo to the view
                 * 
                 */
		it('should add a new todo to the view', function () {
			setUpModel([]);

			subject.setView('');

			view.render.calls.reset();
			model.read.calls.reset();
			model.read.and.callFake(function (callback) {
				callback([{
					title: 'a new todo',
					completed: false
				}]);
			});

			view.trigger('newTodo', 'a new todo');

			expect(model.read).toHaveBeenCalled();

			expect(view.render).toHaveBeenCalledWith('showEntries', [{
				title: 'a new todo',
				completed: false
			}]);
		});
                 /**
                 * spécification du test :should clear the input field when a new todo is added
                 * 
                 */
		it('should clear the input field when a new todo is added', function () {
			setUpModel([]);

			subject.setView('');

			view.trigger('newTodo', 'a new todo');

			expect(view.render).toHaveBeenCalledWith('clearNewTodo');
		});
	});
        /**
         * suite de test pour la suppression d'élément
         * 
         */
        
	describe('element removal', function () {
                 /**
                 * spécification du test :should remove an entry from the model
                 * 
                 */
		it('should remove an entry from the model', function () {
                        /* HB_26_12_2020  vérifie qu'on supprime une tache du modèle*/
                         var todo = {id:561234,title:'tache4',completed:true};
                         setUpModel([todo]);
                         subject.setView('');
                         view.trigger('itemRemove', {id:561234});
                         expect(model.remove).toHaveBeenCalledWith(561234, jasmine.any(Function));
		});
                 /**
                 * spécification du test :should remove an entry from the view
                 * 
                 */
		it('should remove an entry from the view', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('');
			view.trigger('itemRemove', {id: 42});

			expect(view.render).toHaveBeenCalledWith('removeItem', 42);
		});
                 /**
                 * spécification du test :should update the element count
                 * 
                 */
		it('should update the element count', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('');
			view.trigger('itemRemove', {id: 42});

			expect(view.render).toHaveBeenCalledWith('updateElementCount', 0);
		});
	});
        /**
         * suite de test pour la supression des todos completed
         * 
         */
	describe('remove completed', function () {
                 /**
                 * spécification du test :should remove a completed entry from the model
                 * 
                 */
		it('should remove a completed entry from the model', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('');
			view.trigger('removeCompleted');

			expect(model.read).toHaveBeenCalledWith({completed: true}, jasmine.any(Function));
			expect(model.remove).toHaveBeenCalledWith(42, jasmine.any(Function));
		});
                 /**
                 * spécification du test :should remove a completed entry from the view
                 * 
                 */
		it('should remove a completed entry from the view', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('');
			view.trigger('removeCompleted');

			expect(view.render).toHaveBeenCalledWith('removeItem', 42);
		});
	});
        /**
         * suite de test pour les éléments qui basculent en terminés
         * 
         */
	describe('element complete toggle', function () {
                 /**
                 * spécification du test :should update the model
                 * 
                 */
		it('should update the model', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);
			subject.setView('');

			view.trigger('itemToggle', {id: 21, completed: true});

			expect(model.update).toHaveBeenCalledWith(21, {completed: true}, jasmine.any(Function));
		});
                /**
                 * spécification du test :should update the view
                 * 
                 */
		it('should update the view', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);
			subject.setView('');

			view.trigger('itemToggle', {id: 42, completed: false});

			expect(view.render).toHaveBeenCalledWith('elementComplete', {id: 42, completed: false});
		});
	});
        /**
         * suite de test pour l'édition de todo
         * 
         */
	describe('edit item', function () {
                /**
                 * spécification du test :should switch to edit mode
                 * 
                 */
		it('should switch to edit mode', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEdit', {id: 21});

			expect(view.render).toHaveBeenCalledWith('editItem', {id: 21, title: 'my todo'});
		});
                /**
                 * spécification du test :should leave edit mode on done
                 * 
                 */
		it('should leave edit mode on done', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', {id: 21, title: 'new title'});

			expect(view.render).toHaveBeenCalledWith('editItemDone', {id: 21, title: 'new title'});
		});
                 /**
                 * spécification du test :should persist the changes on done
                 * 
                 */
		it('should persist the changes on done', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', {id: 21, title: 'new title'});

			expect(model.update).toHaveBeenCalledWith(21, {title: 'new title'}, jasmine.any(Function));
		});
                /**
                 * spécification du test :should remove the element from the model when persisting an empty title
                 * 
                 */
		it('should remove the element from the model when persisting an empty title', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', {id: 21, title: ''});

			expect(model.remove).toHaveBeenCalledWith(21, jasmine.any(Function));
		});
                /**
                 * spécification du test :should remove the element from the view when persisting an empty title
                 * 
                 */
		it('should remove the element from the view when persisting an empty title', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditDone', {id: 21, title: ''});

			expect(view.render).toHaveBeenCalledWith('removeItem', 21);
		});
                /**
                 * spécification du test :should leave edit mode on cancel
                 * 
                 */
		it('should leave edit mode on cancel', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditCancel', {id: 21});

			expect(view.render).toHaveBeenCalledWith('editItemDone', {id: 21, title: 'my todo'});
		});
                /**
                 * spécification du test :should not persist the changes on cancel
                 * 
                 */
		it('should not persist the changes on cancel', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

			view.trigger('itemEditCancel', {id: 21});

			expect(model.update).not.toHaveBeenCalled();
		});
	});
});
