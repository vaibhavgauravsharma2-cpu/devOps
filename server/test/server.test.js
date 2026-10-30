/**
 * Server Unit & Smoke Tests
 * Executed by Jenkins CI/CD Pipeline in Stage 4: Test
 */
const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('Backend Server Test Suite', () => {
  it('should verify essential constants are properly defined', () => {
    const { ROLES, EMAIL_PROVIDER, MERCHANT_STATUS } = require('../constants');

    assert.ok(ROLES, 'ROLES constant must be defined');
    assert.strictEqual(ROLES.Admin, 'ROLE ADMIN');
    assert.strictEqual(ROLES.Member, 'ROLE MEMBER');
    assert.strictEqual(ROLES.Merchant, 'ROLE MERCHANT');

    assert.ok(EMAIL_PROVIDER, 'EMAIL_PROVIDER constant must be defined');
    assert.strictEqual(EMAIL_PROVIDER.Email, 'Email');

    assert.ok(MERCHANT_STATUS, 'MERCHANT_STATUS must be defined');
    assert.strictEqual(MERCHANT_STATUS.Waiting_Approval, 'Waiting Approval');
    assert.strictEqual(MERCHANT_STATUS.Approved, 'Approved');
    assert.strictEqual(MERCHANT_STATUS.Rejected, 'Rejected');
  });

  it('should verify configuration structure and defaults in config/keys.js', () => {
    const keys = require('../config/keys');

    assert.ok(keys.app, 'keys.app must be present');
    assert.strictEqual(keys.app.name, 'Mern Ecommerce');
    assert.ok(keys.port, 'keys.port must have a port number or default');
    assert.ok(keys.database, 'keys.database object must exist');
    assert.ok(keys.jwt, 'keys.jwt must exist');
    assert.strictEqual(keys.jwt.tokenLife, '7d');
  });

  it('should verify query builder utilities generate valid aggregation pipelines', () => {
    const { getStoreProductsQuery } = require('../utils/queries');
    assert.strictEqual(typeof getStoreProductsQuery, 'function');

    const query = getStoreProductsQuery(10, 100, 4);
    assert.ok(Array.isArray(query), 'getStoreProductsQuery must return an array pipeline');
    assert.ok(query.length > 0, 'Pipeline must contain aggregation stages');
  });

  it('should compile and validate Mongoose models without syntax errors', () => {
    const User = require('../models/user');
    const Product = require('../models/product');
    const Brand = require('../models/brand');
    const Category = require('../models/category');

    assert.ok(User, 'User model must compile');
    assert.ok(Product, 'Product model must compile');
    assert.ok(Brand, 'Brand model must compile');
    assert.ok(Category, 'Category model must compile');

    assert.strictEqual(User.modelName, 'User');
    assert.strictEqual(Product.modelName, 'Product');
    assert.strictEqual(Brand.modelName, 'Brand');
    assert.strictEqual(Category.modelName, 'Category');
  });

  it('should verify Express routes export a valid router instance', () => {
    const routes = require('../routes');
    assert.ok(routes, 'routes module must export an object');
    assert.strictEqual(typeof routes, 'function', 'Express router must be a callable middleware function');
  });
});
