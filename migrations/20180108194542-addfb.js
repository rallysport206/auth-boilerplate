'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
  //add collumns facbookID and facebooktoken
    return queryInterface.addColumn('users', 'facebookID', Sequelize.STRING).then(function(){
      return queryInterface.addColumn('users','facebookToken', Sequelize.STRING);
    });
  },

  down: (queryInterface, Sequelize) => {
  //remove columns facebookID and facebooktoken
    return queryInterface.removeColumn('users', 'facebookID').then(function(){
      return queryInterface.removeColumn('users','facebookToken');
    });
  }
}
