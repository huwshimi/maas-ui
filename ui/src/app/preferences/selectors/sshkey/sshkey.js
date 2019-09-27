const sshkey = {};

/**
 * Returns a list of all SSH keys.
 * @param {Object} state - The redux state.
 * @returns {Array} A list of all state.sshkey.items.
 */
sshkey.all = state => state.sshkey.items;

/**
 * Whether the SSH keys are loading.
 * @param {Object} state - The redux state.
 * @returns {Boolean} Whether SSH keys are loading.
 */
sshkey.loading = state => state.sshkey.loading;

/**
 * Whether the SSH keys have been loaded.
 * @param {Object} state - The redux state.
 * @returns {Boolean} Whether SSH keys have loaded.
 */
sshkey.loaded = state => state.sshkey.loaded;

/**
 * Get the SSH key errors.
 * @param {Object} state - The redux state.
 * @returns {String} The errors from the API.
 */
sshkey.errors = state => state.sshkey.errors;

export default sshkey;
