const db = require('../data/dbConfig');

module.exports = {
  find,
  findById,
  findSteps,
  add,
  update,
  remove,
  addStep
};

/**
 * find()
 *
 * Calling find returns a promise that resolves to an array of all schemes in the database.
 * No steps are included.
 */
async function find() {
  return await db('schemes');
}

/**
 * findById(id)
 *
 * Expects a scheme id as its only parameter.
 * Resolve to a single scheme object.
 * On an invalid id, resolves to null.
 * @param {number} id
 */
async function findById(id) {
  return (
    (await db('schemes')
      .where({ id })
      .first()) || null
  );
}

/**
 * findSteps(id)
 *
 * Expects a scheme id.
 * Resolves to an array of all correctly ordered step for the given scheme:
 * [
 *   { id: 17, scheme_name: 'Find the Holy Grail', step_number: 1, instructions: 'quest'},
 *   { id: 18, scheme_name: 'Find the Holy Grail', step_number: 2, instructions: '...and quest'},
 *   etc.
 * ]
 * This array should include the scheme_name not the scheme_id.
 * @param {number} id
 */
async function findSteps(id) {
  // SELECT s.id, s.scheme_name, st.step_number, st.instructions FROM
  // schemes AS s INNER JOIN steps AS st ON s.id = st.scheme_id
  return await db('schemes')
    .join('steps', { 'steps.scheme_id': 'schemes.id' })
    .select(
      'steps.id',
      'schemes.scheme_name',
      'steps.step_number',
      'steps.instructions'
    )
    .where('schemes.id', id);
}

/**
 * add(scheme)
 *
 * Expects a scheme object.
 * Inserts scheme into the database.
 * Resolves to the newly inserted scheme, including id.
 * @param {object} scheme
 */
async function add(scheme) {
  const id = await db('schemes').insert(scheme, 'id');
  return findById(...id);
}

/**
 * update(changes, id)
 *
 * Expects a changes object and an id.
 * Updates the scheme with the given id.
 * Resolves to the newly updated scheme object.
 * @param {object} changes
 * @param {number} id
 */
async function update(changes, id) {
  await db('schemes')
    .where({ id })
    .update(changes);
  return findById(id);
}

/**
 * remove(id)
 *
 * Removes the scheme object with the provided id.
 * Resolves to the removed scheme
 * Resolves to null on an invalid id.
 * @param {number} id
 */
async function remove(id) {
  const delScheme = await findById(id);
  const del_ = await db('schemes')
    .where({ id })
    .del();
  return del_ ? delScheme : null;
}

/**
 * addStep(step, scheme_id)
 *
 * This method expects a step object and a scheme id.
 * It inserts the new step into the database, correctly linking it to the intended scheme.
 * @param {object} step
 * @param {number} scheme_id
 */
async function addStep(step, scheme_id) {
  await db('steps').insert({ ...step, scheme_id }, 'id');
  return await findSteps(scheme_id);
}
