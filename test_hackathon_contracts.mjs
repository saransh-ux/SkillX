/**
 * COMPREHENSIVE CONTRACT AND DATA INTEGRITY VERIFIER
 * Validates all 10 hackathon backend contracts, fallback data integrity,
 * feature constraints, and terminology rules.
 */

import { getMarketSummary } from './src/api/market.js';
import { getTopSkills, getRelatedSkills } from './src/api/skills.js';
import { getGenomeNetwork } from './src/api/genome.js';
import {
  getJuniorModel,
  predictJuniorSuccess,
  getSeniorModel,
  predictSeniorSuccess,
  runCareerScan
} from './src/api/career.js';
import { queryCopilot, SUGGESTED_COPILOT_PROMPTS } from './src/api/copilot.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✓ PASSED: ${message}`);
    passedTests++;
  }
}

async function runAllTests() {
  console.log('====================================================');
  console.log('STARTING HACKATHON CONTRACT & TERMINOLOGY AUDIT');
  console.log('====================================================\n');

  // TEST 1: Market Summary
  console.log('--- 1. Market Summary (GET /api/market/summary) ---');
  const market = await getMarketSummary();
  assert(market && typeof market === 'object', 'Market summary returns valid object');
  assert(market.sampleSize === '4,820,000' || market.sampleSize.includes('4.82'), 'Corpus volume matches 4.82M empirical dataset');
  assert(market.topDemandedSkill === 'PYTHON', 'Top demanded skill is PYTHON');

  // TEST 2: Top Skills (GET /api/skills/top)
  console.log('\n--- 2. Top Skills (GET /api/skills/top) ---');
  const topSkills = await getTopSkills(5);
  assert(Array.isArray(topSkills) && topSkills.length === 5, 'getTopSkills returns requested limit');
  assert(topSkills[0].name && topSkills[0].emergenceScore !== undefined, 'Top skill has name and emergenceScore');

  // TEST 3: Related Skills (GET /api/skills/{skill}/related)
  console.log('\n--- 3. Related Skills (GET /api/skills/{skill}/related) ---');
  const related = await getRelatedSkills('Python');
  assert(related && related.skill === 'Python', 'getRelatedSkills resolves anchor skill');
  assert(Array.isArray(related.relatedSkills), 'getRelatedSkills returns related skills array');

  // TEST 4: Genome Network (GET /api/skills/genome)
  console.log('\n--- 4. Genome Network (GET /api/skills/genome) ---');
  const genome = await getGenomeNetwork();
  assert(Array.isArray(genome.nodes) && genome.nodes.length > 0, 'Genome contains topological nodes');
  assert(Array.isArray(genome.links) && genome.links.length > 0, 'Genome contains co-occurrence links');

  // TEST 5: Junior Model (GET /api/career/junior/model)
  console.log('\n--- 5. Junior Model Specification (GET /api/career/junior/model) ---');
  const juniorModel = await getJuniorModel();
  assert(juniorModel.target === 'salary_hike_high_or_low', 'Junior model target is strictly salary_hike_high_or_low');
  assert(Array.isArray(juniorModel.features) && juniorModel.features.length >= 5, 'Junior model exposes dynamic feature array');

  // TEST 6: Junior Prediction (POST /api/career/junior/predict)
  console.log('\n--- 6. Junior Prediction (POST /api/career/junior/predict) ---');
  const juniorPred = await predictJuniorSuccess(['Python', 'SQL', 'Machine Learning']);
  assert(
    juniorPred.predictedSalaryHikeClass === 'High' || juniorPred.predictedSalaryHikeClass === 'Low',
    'Junior prediction output uses terminology "predicted salary-hike class"'
  );
  if (juniorPred.highSalaryHikeProbability !== undefined) {
    assert(
      typeof juniorPred.highSalaryHikeProbability === 'number',
      'High salary-hike probability is a numerical probability'
    );
  }

  // TEST 7: Senior Model (GET /api/career/senior/model)
  console.log('\n--- 7. Senior Model Specification (GET /api/career/senior/model) ---');
  const seniorModel = await getSeniorModel();
  assert(seniorModel.target === 'success_classification_high_low', 'Senior model target is strictly success_classification_high_low');
  
  // Verify ONLY Big Five features
  const allowedTraits = ['Neuroticism', 'Extraversion', 'Openness', 'Agreeableness', 'Conscientiousness'];
  const featureNames = seniorModel.features.map(f => f.name || f);
  const forbiddenFeatures = ['Strategic Thinking', 'Mentorship', 'Cross-Functional Influence', 'System Architecture'];
  
  const hasForbidden = featureNames.some(f => forbiddenFeatures.includes(f));
  assert(!hasForbidden, 'Senior model has ZERO forbidden features (no Strategic Thinking, Mentorship, etc.)');
  
  const allAllowed = featureNames.every(f => allowedTraits.includes(f));
  assert(allAllowed, 'Senior model features contain ONLY the actual Big Five dimensions');

  // TEST 8: Senior Prediction (POST /api/career/senior/predict)
  console.log('\n--- 8. Senior Prediction (POST /api/career/senior/predict) ---');
  const seniorPred = await predictSeniorSuccess({
    Openness: 4.2,
    Conscientiousness: 4.0,
    Extraversion: 3.6,
    Agreeableness: 3.5,
    Neuroticism: 2.0
  });
  assert(
    seniorPred.predictedSuccessClass === 'High' || seniorPred.predictedSuccessClass === 'Low',
    'Senior prediction output uses terminology "predicted success class"'
  );
  if (seniorPred.highSuccessProbability !== undefined) {
    assert(
      typeof seniorPred.highSuccessProbability === 'number',
      'High-success probability is a validated numerical probability'
    );
  }

  // TEST 9: Career Scan (POST /api/career/scan)
  console.log('\n--- 9. Career Scan (POST /api/career/scan) ---');
  const scan = await runCareerScan({
    targetRole: 'Data Scientist',
    experienceLevel: 'Junior',
    currentSkills: ['Python', 'SQL']
  });
  assert(Array.isArray(scan.marketSignals) && scan.marketSignals.length > 0, 'Career scan provides market signals');
  assert(Array.isArray(scan.relevantSkills) && scan.relevantSkills.length > 0, 'Career scan provides relevant skills');
  assert(Array.isArray(scan.modelAssociatedSkills), 'Career scan provides model-associated skill signals');
  assert(Array.isArray(scan.evidenceDerivedRecommendations), 'Career scan provides evidence-derived recommendations');
  assert(scan.highSuccessProbability === null, 'Career scan does NOT invent a match probability when unvalidated by model');

  // TEST 10: Copilot (POST /api/copilot/query)
  console.log('\n--- 10. Copilot Analytics (POST /api/copilot/query) ---');
  assert(SUGGESTED_COPILOT_PROMPTS.length === 6, 'Exposes exact 6 suggested analytical prompts');
  
  // Test senior success query
  const seniorPrompt = "What personality traits are associated with senior success?";
  assert(SUGGESTED_COPILOT_PROMPTS.includes(seniorPrompt), 'Copilot includes exact requested senior prompt');
  
  const copilotRes = await queryCopilot(seniorPrompt);
  assert(copilotRes.answer && copilotRes.answer.includes('Openness'), 'Copilot answers senior traits query accurately');
  assert(!copilotRes.answer.toLowerCase().includes('retention'), 'Copilot response has ZERO mention of senior retention');

  // Test technical salary hike query
  const juniorPrompt = "Which technical skills are associated with higher salary-hike outcomes?";
  const copilotJuniorRes = await queryCopilot(juniorPrompt);
  assert(copilotJuniorRes.answer && copilotJuniorRes.answer.includes('Python'), 'Copilot answers junior technical skills query');

  console.log('\n====================================================');
  console.log(`AUDIT COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('====================================================');
}

runAllTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
