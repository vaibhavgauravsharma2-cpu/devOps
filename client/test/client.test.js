/**
 * Client Unit & Configuration Tests
 * Executed by Jenkins CI/CD Pipeline in Stage 4: Test
 */
const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

describe('Frontend Client Test Suite', () => {
  it('should verify client package.json configuration and essential scripts', () => {
    const pkgPath = path.join(__dirname, '../package.json');
    assert.ok(fs.existsSync(pkgPath), 'package.json must exist');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    assert.strictEqual(pkg.name, 'client');
    assert.ok(pkg.scripts.build, 'build script must exist');
    assert.ok(pkg.scripts.dev, 'dev script must exist');
    assert.ok(pkg.dependencies.react, 'React must be a dependency');
    assert.ok(pkg.dependencies.redux, 'Redux must be a dependency');
  });

  it('should verify Webpack configurations exist and export valid configuration objects', () => {
    const commonPath = path.join(__dirname, '../webpack/webpack.common.js');
    const devPath = path.join(__dirname, '../webpack/webpack.dev.js');
    const prodPath = path.join(__dirname, '../webpack/webpack.prod.js');

    assert.ok(fs.existsSync(commonPath), 'webpack.common.js must exist');
    assert.ok(fs.existsSync(devPath), 'webpack.dev.js must exist');
    assert.ok(fs.existsSync(prodPath), 'webpack.prod.js must exist');

    const commonConfig = require('../webpack/webpack.common.js');
    assert.ok(commonConfig.entry, 'Webpack entry must be configured');
    assert.ok(commonConfig.module, 'Webpack module loaders must be configured');
  });

  it('should verify HTML template and favicon assets exist in public folder', () => {
    const htmlPath = path.join(__dirname, '../public/index.html');
    const faviconPath = path.join(__dirname, '../public/images/favicon.ico');

    assert.ok(fs.existsSync(htmlPath), 'index.html template must exist in public folder');
    assert.ok(fs.existsSync(faviconPath), 'favicon.ico must exist in public folder');

    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    assert.ok(htmlContent.includes('<div id="root"></div>'), 'Root DOM container must exist');
  });

  it('should verify client environment configuration template is valid', () => {
    const envExamplePath = path.join(__dirname, '../.env.example');
    assert.ok(fs.existsSync(envExamplePath), '.env.example must exist');
    const content = fs.readFileSync(envExamplePath, 'utf8');
    assert.ok(content.includes('API_URL='), '.env.example must specify API_URL');
  });
});
