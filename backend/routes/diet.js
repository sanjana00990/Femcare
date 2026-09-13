const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();

const dietData = {
  general: {
    eat: [
      { emoji: '🥬', name: 'Leafy Greens', why: 'Iron & folate support' },
      { emoji: '🐟', name: 'Fatty Fish', why: 'Omega-3 reduces inflammation' },
      { emoji: '🫐', name: 'Berries', why: 'Antioxidant & hormone support' },
      { emoji: '🥜', name: 'Nuts & Seeds', why: 'Magnesium & healthy fats' },
      { emoji: '🫘', name: 'Legumes', why: 'Plant protein & fibre' },
      { emoji: '🍠', name: 'Sweet Potato', why: 'Complex carbs & B6' }
    ],
    limit: [
      { emoji: '🍞', name: 'Refined Carbs', why: 'Spikes insulin levels' },
      { emoji: '🧂', name: 'High Sodium', why: 'Worsens bloating' },
      { emoji: '☕', name: 'Caffeine', why: 'Increases cortisol' },
      { emoji: '🍷', name: 'Alcohol', why: 'Disrupts hormone balance' }
    ],
    avoid: [
      { emoji: '🍬', name: 'Refined Sugar', why: 'Triggers inflammation' },
      { emoji: '🌭', name: 'Processed Meats', why: 'High in sodium & hormones' },
      { emoji: '🧋', name: 'Sugary Drinks', why: 'Blood sugar spikes' },
      { emoji: '🍟', name: 'Trans Fats', why: 'Hormonal disruption' }
    ]
  },
  pcos: {
    eat: [
      { emoji: '🥦', name: 'Cruciferous Vegs', why: 'Supports estrogen balance' },
      { emoji: '🐟', name: 'Fatty Fish', why: 'Reduces androgen levels' },
      { emoji: '🥚', name: 'Eggs', why: 'Protein & hormone regulation' },
      { emoji: '🫘', name: 'Lentils', why: 'Low-GI protein source' },
      { emoji: '🌰', name: 'Walnuts', why: 'Omega-3 & anti-inflammatory' },
      { emoji: '🍵', name: 'Spearmint Tea', why: 'Reduces testosterone naturally' }
    ],
    limit: [
      { emoji: '🍞', name: 'White Bread', why: 'Causes insulin spike' },
      { emoji: '🥛', name: 'Dairy', why: 'May worsen androgen levels' },
      { emoji: '☕', name: 'Caffeine', why: 'Increases cortisol & anxiety' },
      { emoji: '🍷', name: 'Alcohol', why: 'Disrupts insulin sensitivity' }
    ],
    avoid: [
      { emoji: '🍬', name: 'Sugar', why: 'Worsens insulin resistance' },
      { emoji: '🍟', name: 'Fried Foods', why: 'Increases inflammation' },
      { emoji: '🌭', name: 'Processed Foods', why: 'High glycemic index' },
      { emoji: '🧁', name: 'Baked Goods', why: 'Trans fats & refined sugar' }
    ]
  },
  menopause: {
    eat: [
      { emoji: '🫘', name: 'Soy Products', why: 'Phytoestrogens ease hot flashes' },
      { emoji: '🥦', name: 'Broccoli', why: 'Calcium & bone support' },
      { emoji: '🐟', name: 'Salmon', why: 'Vitamin D & omega-3' },
      { emoji: '🌿', name: 'Flaxseeds', why: 'Lignans balance hormones' },
      { emoji: '🍵', name: 'Green Tea', why: 'Antioxidants & mood support' },
      { emoji: '🫐', name: 'Blueberries', why: 'Cognitive health support' }
    ],
    limit: [
      { emoji: '🌶️', name: 'Spicy Foods', why: 'Triggers hot flashes' },
      { emoji: '☕', name: 'Caffeine', why: 'Disrupts sleep & hot flashes' },
      { emoji: '🧂', name: 'Sodium', why: 'Increases blood pressure risk' },
      { emoji: '🍷', name: 'Alcohol', why: 'Worsens night sweats' }
    ],
    avoid: [
      { emoji: '🍬', name: 'Refined Sugar', why: 'Weight gain & inflammation' },
      { emoji: '🌭', name: 'Processed Meats', why: 'Cardiovascular risk' },
      { emoji: '🧁', name: 'Sugary Snacks', why: 'Energy crashes' },
      { emoji: '🍟', name: 'Trans Fats', why: 'Heart disease risk' }
    ]
  }
};

// GET /api/diet
router.get('/', protect, async (req, res) => {
  try {
    const condition = req.user.condition || 'general';
    const data = dietData[condition] || dietData['general'];
    res.json({ condition, diet: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
