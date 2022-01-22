/**
 * Copyright (c) 2010-2024 Contributors to the openHAB project
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { expect } from 'chai';
import {
  clamp,
  compareVersion,
  compressJSON,
  decompressJSON,
  decamelize,
  parseUrl,
  stripPunctuation
} from '#root/utils.js';

describe('Utilities Tests', function () {
  describe('clamp', function () {
    it('within range', function () {
      expect(clamp(42, 0, 100)).to.equal(42);
    });

    it('below range', function () {
      expect(clamp(-42, 0, 100)).to.equal(0);
    });

    it('above range', function () {
      expect(clamp(142, 0, 100)).to.equal(100);
    });
  });

  describe('compare version', function () {
    it('equal with same size', function () {
      expect(compareVersion('3.1.0', '3.1.0')).to.equal(0);
    });

    it('equal with different size', function () {
      expect(compareVersion('3', '3.1.0')).to.equal(0);
    });

    it('lower than', function () {
      expect(compareVersion('3.1.0', '3.2.0')).to.equal(-1);
    });

    it('greater than', function () {
      expect(compareVersion('3.1.0', '3.0.0')).to.equal(1);
    });

    it('invalid format', function () {
      try {
        compareVersion('foo', 'bar');
      } catch (error) {
        expect(error).to.be.instanceof(TypeError).and.include({ message: 'Invalid formatted version' });
      }
    });
  });

  describe('compress/decompress json', function () {
    const object = { foo: 1, bar: 2 };

    it('compressed json string', function () {
      const string = compressJSON(object);
      expect(decompressJSON(string)).to.deep.equal(object);
    });

    it('uncompressed json string', function () {
      const string = JSON.stringify(object);
      expect(decompressJSON(string)).to.deep.equal(object);
    });
  });

  describe('decamelize', function () {
    it('default separator', function () {
      expect(decamelize('fooBar')).to.equal('foo_bar');
    });

    it('space separator', function () {
      expect(decamelize('FooBar', ' ')).to.equal('foo bar');
    });
  });

  describe('parse url', function () {
    it('url only', function () {
      expect(parseUrl('https://foo/bar'))
        .to.be.instanceof(URL)
        .and.to.have.property('href')
        .that.equals('https://foo/bar');
    });

    it('url with base', function () {
      expect(parseUrl('https://foo/bar', 'https://bar'))
        .to.be.instanceof(URL)
        .and.to.have.property('href')
        .that.equals('https://bar/bar');
    });

    it('url invalid', function () {
      expect(parseUrl('invalid')).to.be.undefined;
    });
  });

  describe('strip punctuation', function () {
    it('no change', function () {
      expect(stripPunctuation('foo bar')).to.equal('foo bar');
    });

    it('with punctuation no extra space', function () {
      expect(stripPunctuation('foo_bar')).to.equal('foo bar');
    });

    it('with punctuation and extra space', function () {
      expect(stripPunctuation('[ foo | bar ]')).to.equal('foo bar');
    });
  });
});
