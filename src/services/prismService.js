// Service for handling Prism functionality
import chatService from './chatService';
import { getSystemPrompt } from '../utils/systemPrompt';

class PrismService {
  constructor() {
    this.prismFiles = [];
    this.loadPrismFileList();
  }

  // Load the list of available prism files
  async loadPrismFileList() {
    // Complete list of all 498 theoretical lenses from the prism directory
    this.prismFiles = [
      'Abolition Studies', 'Absurdism', 'Accelerationism', 'Accelerationist Aesthetics',
      'Accelerationist Feminism', 'Acculturation Theory', 'Actor-Network Theory', 'Aesthetics',
      'Affect Theory', 'Affective Labor Theory', 'Afro-Pessimism', 'Afrofuturism',
      'Age Studies', 'Agential Realism', 'Agroecology', 'AI Ethics', 'Algorithm Studies',
      'Algorithmic Governance', 'Algorithmic Justice', 'Amerindian Perspectivism',
      'Analytic Philosophy', 'Anarcha-feminism', 'Anarchist Theory', 'Anti-Oppressive Social Work',
      'Anticipatory Ethnography', 'Anticipatory Governance', 'Applied Anthropology', 'Applied Ethics',
      'Archetypal Criticism', 'Assemblage Theory', 'Atmospherics', 'Attachment Theory',
      'Attribution Theory', 'Authenticity Theory', 'Autoethnography', 'Automation Studies',
      'Autonomist Marxism', 'Behavioral Economics', 'Behaviorism', 'Bibliometrics',
      'Bioethics', 'Biographical Historical Criticism', 'Biological Essentialism', 'Biopolitics',
      'Biosemiotics', 'Black Feminism-Womanism', 'Book History', 'Border Studies',
      'British Cultural Marxism (Birmingham School)', 'Buddhist Philosophy', 'Buen Vivir',
      'Capability Approach', 'Capitalist Realism', 'Carceral Studies', 'Care Ethics',
      'Catastrophe Theory', 'Chaos Theory', 'Chicana Feminism', 'Chronopolitics',
      'Class Composition Analysis', 'Class Theory', 'Climate Justice', 'Cognitive Bias Theory',
      'Cognitive Capitalism Theory', 'Cognitive Dissonance Theory', 'Cognitive Linguistics',
      'Cognitive Theory', 'Cognitive-Behavioral Theory', 'Collapse Theory', 'Collective Action Theory',
      'Collective Intelligence', 'Combinatorial Creativity Theory', 'Commoning', 'Commons Theory',
      'Communitarianism', 'Community Health Praxis', 'Comparative History', 'Comparative Literature',
      'Complexity Economics', 'Complexity Theory', 'Computational Humanities', 'Computational Sociology',
      'Confirmation Bias', 'Conflict Theory', 'Confucian Hermeneutics', 'Consequentialism',
      'Constructive Developmental Theory', 'Constructivism', 'Contact Linguistics', 'Continental Philosophy',
      'Control Theory', 'Conversation Analysis', 'Crip Queer Theory', 'Crip Technoscience',
      'Crip Theory', 'Critical Agrarian Studies', 'Critical Algorithm Studies', 'Critical Animal Studies',
      'Critical Cartography', 'Critical Code Studies', 'Critical Digital Studies', 'Critical Disability Theory',
      'Critical Information Literacy', 'Critical International Relations Theory', 'Critical Legal Studies', 'Critical Management Studies',
      'Critical Medical Studies', 'Critical Pedagogy', 'Critical Posthumanism', 'Critical Race Theory',
      'Critical Race Theory in Education', 'Critical Security Studies', 'Critical Terrorism Studies', 'Critical Theory (Sociology)',
      'Cryopolitics', 'Cryptoeconomics', 'Cryptopolitics', 'Cultivation Theory',
      'Cultural Analytics', 'Cultural Anthropology', 'Cultural Evolution Theory', 'Cultural History',
      'Cultural Lag Theory', 'Cultural Materialism', 'Cultural Relativism', 'Cultural Studies',
      'Cultural Transmission Theory', 'Culturally Responsive Pedagogy', 'Culturally Sustaining Pedagogy', 'Curatorial Studies',
      'Curriculum Theory', 'Cyberfeminism', 'Cybernetics', 'Daoist Philosophy',
      'Dark Ecology', 'Data Feminism', 'Decolonial Feminism', 'Decolonial Theory',
      'Deconstruction', 'Deep Time', 'Deepfake Studies', 'Degrowth Theory',
      'Democratic Education Theory', 'Democratic Theory', 'Deontological Ethics', 'Dependency Theory',
      'Design Thinking', 'Deterrence Theory', 'Dialectical Materialism', 'Diaspora Studies',
      'Diffraction (Barad)', 'Diffusion of Innovations Theory', 'Diffusive Methodology', 'Digital Anthropology',
      'Digital Colonialism', 'Digital Humanities', 'Digital Labor Studies', 'Digital Literary Studies',
      'Disability Studies', 'Disaster Studies', 'Discourse Analysis', 'DisCrit (Disability Critical Race Theory)',
      'Distributed Cognition', 'Documentation Studies', 'Dramaturgical Analysis', 'Dramaturgy',
      'Dualism (Metaphysics)', 'Ecocriticism', 'Ecofeminism', 'Ecolinguistics',
      'Ecological Economics', 'Ecological Systems Theory', 'Economic Incentive Theory', 'Ecosophy',
      'Ego Depletion Theory', 'Elaboration Likelihood Model', 'Embodied Cognition', 'Emergentism',
      'Emotional Labor Theory', 'Enactivism', 'Encoding-Decoding Model of Communication', 'Energy Humanities',
      'Engaged Theory', 'Environmental History', 'Environmental Justice Framework', 'Environmental Psychology',
      'Epicureanism', 'Episodic Future Thinking', 'Epistemic Injustice Theory', 'Epistemology',
      'Ethical Framework Theory', 'Ethnofuturism', 'Ethnographic Method', 'Ethnomethodology',
      'Evolutionary Biology', 'Evolutionary Game Theory', 'Evolutionary Psychology', 'Existentialism',
      'Experimental Philosophy', 'Extended Evolutionary Synthesis', 'Extended Mind Theory', 'Extinction Studies',
      'Fashion Studies', 'Fat Studies', 'Feminist Care Ethics', 'Feminist Criticism',
      'Feminist Economics', 'Feminist Internet Studies', 'Feminist Intersectionality Theory', 'Feminist New Materialism',
      'Feminist Security Studies', 'Field Theory (Bourdieu)', 'Food Sovereignty Theory', 'Food Studies',
      'Forensic Architecture', 'Formalism', 'Fourth Generation Warfare', 'Frankfurt School Critical Theory',
      'Futures Studies', 'Game Theory', 'Gastropolitics', 'Gender History',
      'Genealogical Method', 'Generational Trauma', 'Generative Anthropology', 'Genre Theory',
      'Geoeconomics', 'Geopoetics', 'Gestalt Theory', 'Glitch Studies',
      'Global South Urbanism', 'Glottopolitics', 'Grounded Theory', 'Gulf Modernism',
      'Hacker Studies', 'Hauntology', 'Hegelian Dialectics', 'Hermeneutics',
      'Hindu Philosophy', 'Historical Linguistics', 'Historical Pattern Analysis', 'History of Science and Technology',
      'Homonationalism', 'Human-Computer Interaction (HCI)', 'Humanistic Psychology', 'Hydrofeminism',
      'Hyperstition', 'Idealism (Metaphysics)', 'Indigenous Epistemologies', 'Indigenous Feminism',
      'Indigenous Futurisms', 'Influencer Studies', 'Information Behavior Theory', 'Information Ethics',
      'Information Theory', 'Innovation Theory', 'Institutional Analysis', 'Institutional Economics',
      'Integrative Pluralism', 'Intellectual History', 'Intercultural Communication Theory', 'Interdisciplinary Studies',
      'Internet Governance Studies', 'Intersectionality Theory', 'Interspecies Ethics', 'Islamic Philosophy',
      'Italian Autonomism', 'Jurisprudence', 'Just City Theory', 'Keynesian Economics',
      'Knowledge Organization Theory', 'Labor Process Theory', 'Latin American Decolonial Thought', 'Latin American Dependency Theory',
      'Law and Society', 'Learning Sciences', 'Legal Pluralism', 'Liberalism-Liberal Institutionalism',
      'Liberation Theology', 'Libertarian Theory', 'Life Writing', 'Linguistic Anthropology',
      'Linguistic Relativity', 'Logical Positivism', 'Lumpenproletariat Analysis', 'Machine Ethics',
      'Machinic Phylum', 'Mad Studies', 'Marxist Criticism', 'Marxist Economics',
      'Masculine Studies', 'Material Engagement Theory', 'Materialism (Metaphysics)', 'Media Archaeology',
      'Media Theory', 'Medical Anthropology', 'Medical Humanities', 'Meme Studies',
      'Memetics', 'Memory Studies', 'Meta Ethics', 'Metaethics',
      'Metamodernism', 'Metaverse Studies', 'Microhistory', 'Mimetic Theory',
      'Modal Logic', 'Modal Realism', 'Modern Monetary Theory (MMT)', 'Moral Panic Theory',
      'Moral Psychology', 'More-than-Human Geography', 'Morphological Analysis', 'Morphosyntax',
      'Multispecies Ethnography', 'Multispecies Studies', 'Muslim Feminism', 'Mysticism Studies',
      'Narrative Medicine', 'Narratology', 'Necrofuturism', 'Necropolitics',
      'Neoclassical Economics', 'Network Theory', 'Neuroaesthetics', 'Neurophenomenology',
      'Neuroqueerness', 'New Criticism', 'New Historicism', 'New Materialism',
      'Nihilism', 'Non-Representational Theory', 'Nonlinear Dynamics', 'Nonviolent Communication (NVC)',
      'Normative Ethics', 'Object-Oriented Ontology (OOO)', 'Olfactory Ethics', 'One Health Approach',
      'Optimal Foraging Theory', 'Oral History', 'Oral Law Traditions', 'Organizational Ambidexterity',
      'Organizational Justice Theory', 'Organizational Theory', 'Panpsychism', 'Participatory Action Research',
      'Pataphysics', 'Path Dependence Theory', 'Peace Studies', 'Performance Studies',
      'Performativity Theory', 'Permaculture Design', 'Petrocultures', 'Phenomenology',
      'Phenomenology of Religion', 'Philology', 'Philosophy of Emotions', 'Philosophy of Language',
      'Philosophy of Mind', 'Philosophy of Science', 'Philosophy of Technology', 'Phonetics and Phonology',
      'Planetary Thinking', 'Planetary Urbanization', 'Plantationocene Studies', 'Plastics Studies',
      'Platform Cooperativism', 'Platform Studies', 'Policing Studies', 'Political Ecology',
      'Populism Studies', 'Positive Psychology', 'Post-Keynesian Economics', 'Post-structuralism',
      'Postcolonial Theory', 'Postdigital Theory', 'Postgeography', 'Posthuman Critical Theory',
      'Postmodernism', 'Postphenomenology', 'Pragmatics', 'Pragmatism',
      'Precariat Studies', 'Process Philosophy', 'Professional-Managerial Class Theory', 'Promethean Theory',
      'Protocol Studies', 'Psychoanalytic Criticism', 'Psychoanalytic Theory', 'Psychogeography',
      'Psycholinguistics', 'Psychological Safety Theory', 'Public Policy Analysis', 'Quantum Social Theory',
      'Queer Ecology', 'Queer Game Studies', 'Queer of Color Critique', 'Queer Theory',
      'Race Critical Code Studies', 'Racial Capitalism Theory', 'Radical Embodied Cognitive Science', 'Radical Feminism',
      'Rasa Theory', 'Rational Choice Theory', 'Rational Emotive Behavior Therapy (REBT)', 'Reader-Response Theory',
      'Realism', 'Regulatory Focus Theory', 'Relational Dialectics', 'Relevance Theory',
      'Rentier Capitalism Analysis', 'Republicanism', 'Resilience Theory', 'Resource Mobilization Theory',
      'Restorative Justice', 'Rhetorical Criticism', 'Right to the City', 'Risk Analysis Theory',
      'Risk Society Theory', 'Robot Ethics', 'Salvage Theory', 'Sankofa Philosophy',
      'Schizoanalysis', 'Science and Technology Studies (STS)', 'Science Fiction Studies', 'Securitization Theory',
      'Selective Exposure Theory', 'Self-Categorization Theory', 'Self-Determination Theory', 'Semiotics',
      'Semiotics of Photography', 'Sensory Ethnography', 'Service Worker Theory', 'Signaling Theory',
      'Singularitarianism', 'Sinofuturism', 'Situated Knowledge', 'Situational Crime Prevention',
      'Slow Violence', 'Social Capital Theory', 'Social Comparison Theory', 'Social Constructionism',
      'Social Constructivism', 'Social Contract Theory', 'Social Determinants of Health', 'Social Epidemiology',
      'Social History', 'Social Learning Theory', 'Social Movement Theory', 'Social Network Analysis',
      'Social Psychology', 'Social Reproduction Feminism', 'Social Reproduction Theory', 'Socialist Feminism',
      'Sociolinguistics', 'Software Studies', 'Solarpunk Theory', 'Sound Studies',
      'Spatial Justice', 'Speculative Design', 'Speculative Realism', 'Stack Theory (Bratton)',
      'Stoicism', 'Strengths-Based Practice', 'Structural Anthropology', 'Structural Functionalism',
      'Structuralism', 'Subaltern Studies', 'Surveillance Capitalism Theory (Zuboff)', 'Surveillance Studies',
      'Symbolic Anthropology', 'Symbolic Interactionism', 'Symptomatology', 'Syndemic Theory',
      'Synthetic Biology Ethics', 'Systems Dynamics', 'Systems Theory', 'Systems Thinking',
      'Tactical Urbanism', 'Talmudic Hermeneutics', 'Techno-Orientalism', 'Technofeminism',
      'Technological Determinism', 'Technological Disruption Theory', 'Technological Sovereignty', 'Teleology',
      'Territory Theory', 'Theoretical Biology', 'Thick Description', 'Tourism Studies',
      'Trans Studies', 'Transduction', 'Transfeminism', 'Transformative Learning Theory',
      'Transition Theory', 'Translation Studies', 'Trauma-Informed Practice', 'Ubuntu Philosophy',
      'Unschooling Deschooling Theory', 'Urban Metabolism', 'Virtue Epistemology', 'Virtue Ethics',
      'Visual Culture Studies', 'Web3 Studies', 'Weird Realism', 'Whiteness Studies',
      'Workerism-Operaismo', 'Working Class Studies', 'World History', 'World-Systems Theory',
      'Worlding', 'Xenofeminism', 'Xenophilosophy', 'Yokai Studies'
    ];
  }

  // Randomly select 5-10 prism perspectives (backup method)
  selectRandomPrisms(min = 5, max = 10) {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...this.prismFiles].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    
    console.log(`🔍 Prism Analysis: Selected ${count} perspectives:`, selected);
    return selected;
  }

  // AI-driven prism selection based on user message
  async selectAIPrisms(userMessage, conversationHistory, model, min = 5, max = 8) {
    try {
      const selectionPrompt = `You are a meta-analytical AI that selects the most relevant theoretical lenses for analyzing a given question or topic.

Given the user's message: "${userMessage}"

Available theoretical lenses:
${this.prismFiles.join(', ')}

Instructions:
1. Select between ${min} and ${max} theoretical lenses that would provide the most insightful and diverse perspectives on this question
2. Choose lenses that complement each other and offer different angles of analysis
3. Prioritize lenses that are most relevant to the specific content and context of the question
4. Consider both obvious and non-obvious connections that might yield surprising insights
5. Respond with ONLY a JSON array of the selected lens names, exactly as they appear in the list

Example response format:
["Critical Race Theory", "Systems Theory", "Phenomenology", "Queer Theory", "Environmental Justice Framework"]

Your response:`;

      const selectionMessage = { role: 'system', content: selectionPrompt };
      const selectionConversation = [selectionMessage, { role: 'user', content: userMessage }];
      
      const response = await chatService.sendMessage(selectionConversation, model);
      
      // Parse the JSON response
      let selectedPrisms;
      try {
        selectedPrisms = JSON.parse(response.content.trim());
      } catch (parseError) {
        console.warn('Failed to parse AI prism selection, falling back to random selection:', parseError);
        return this.selectRandomPrisms(min, max);
      }
      
      // Validate that all selected prisms exist in our list
      const validPrisms = selectedPrisms.filter(prism => this.prismFiles.includes(prism));
      
      if (validPrisms.length === 0) {
        console.warn('No valid prisms in AI selection, falling back to random selection');
        return this.selectRandomPrisms(min, max);
      }
      
      console.log(`🤖 AI Selected ${validPrisms.length} prisms:`, validPrisms);
      return validPrisms;
      
    } catch (error) {
      console.error('Error in AI prism selection, falling back to random selection:', error);
      return this.selectRandomPrisms(min, max);
    }
  }

  // Load a specific prism prompt from the server
  async loadPrismPrompt(prismName) {
    try {
      const response = await fetch(`/prism/${prismName}.txt`);
      if (!response.ok) {
        throw new Error(`Failed to load ${prismName}.txt`);
      }
      const content = await response.text();
      return content;
    } catch (error) {
      console.error(`Error loading prism ${prismName}:`, error);
      // Return a fallback prompt structure
      return `Persona:
You are a ${prismName} scholar who approaches problems through the lens of ${prismName.toLowerCase()}.

Epistemic Stance:
Knowledge emerges through applying ${prismName.toLowerCase()} frameworks to understand complex phenomena.

Core Questions:
- How does this phenomenon relate to ${prismName.toLowerCase()} theory?
- What insights does ${prismName.toLowerCase()} offer for understanding this situation?

Response Character:
Write with expertise in ${prismName.toLowerCase()}, bringing unique theoretical insights to bear on the question.`;
    }
  }

  // Generate responses from multiple prism perspectives (in parallel)
  async generatePrismResponses(userMessage, conversationHistory, model, selectedPrisms) {
    // Create conversation history without system prompt for prism perspectives
    const prismConversationHistory = conversationHistory.filter(msg => msg.role !== 'system');
    
    // Generate all prism responses in parallel
    const prismPromises = selectedPrisms.map(async (prismName) => {
      try {
        const prismPrompt = await this.loadPrismPrompt(prismName);
        const extra_instructions = `Keep your response under 300 words, in a concise, clear, conversational style.`;
        
        // Create a conversation with ONLY the prism perspective as system prompt
        const prismSystemMessage = { role: 'system', content: prismPrompt + '\n\n' + extra_instructions };
        const prismConversation = [prismSystemMessage, ...prismConversationHistory];
        
        const response = await chatService.sendMessage(prismConversation, model);
        return {
          perspective: prismName,
          content: response.content
        };
      } catch (error) {
        console.error(`Error generating response for ${prismName}:`, error);
        return {
          perspective: prismName,
          content: `[Error generating ${prismName} perspective]`
        };
      }
    });
    
    // Wait for all prism responses to complete
    const responses = await Promise.all(prismPromises);
    
    // Debug the prism responses
    console.log('🔍 PRISM RESPONSES DEBUG:');
    responses.forEach((response, i) => {
      console.log(`Response ${i}: ${response.perspective}`);
      console.log(`Content length: ${response.content?.length || 0}`);
      console.log(`Content preview: ${response.content?.substring(0, 100) + '...' || 'NO CONTENT'}`);
      console.log('-'.repeat(40));
    });
    
    return responses;
  }

  // Synthesize multiple prism responses into a final response
  async synthesizePrismResponses(userMessage, prismResponses, baseSystemPrompt, model, conversationHistory) {
    console.log('🔄 Synthesizing prism responses...');
    console.log('📊 Prism responses received:', prismResponses.map(r => r.perspective));
    
    // Validate prism responses
    const validPrismResponses = prismResponses.filter(r => r && r.perspective && r.content);
    if (validPrismResponses.length === 0) {
      console.error('⚠️ No valid prism responses to synthesize');
      throw new Error('No valid prism responses provided for synthesis');
    }
    
    console.log('✅ Valid prism responses:', validPrismResponses.length);
    
    // Build perspectives section
    const perspectivesSection = validPrismResponses.map(response => 
      `**${response.perspective} Perspective:**
${response.content}

`).join('');
    
    // Debug: Verify perspectives section is built correctly
    console.log('🔍 PERSPECTIVES SECTION:');
    console.log('='.repeat(80));
    console.log(perspectivesSection);
    console.log('='.repeat(80));
    
    const synthesisPrompt = `${baseSystemPrompt}

You have just received multiple analytical perspectives on the following user question: "${userMessage}"

These specific theoretical lenses were intelligently selected as the most relevant for analyzing this question:

${perspectivesSection}

Consider these perspectives as you formulate your unique, gestalt response to the user inquiry, but don't feel constrained by them.

Keep your response under 250 words, in a clear, conversational style directly addressing the user's question in your own words.`;

    try {
      const synthesisMessage = { role: 'system', content: synthesisPrompt };
      
      // Debug: Log the synthesis prompt to ensure perspectives are included
      console.log('📋 Synthesis prompt length:', synthesisPrompt.length);
      console.log('🔍 Synthesis prompt contains perspectives:', 
        validPrismResponses.every(r => synthesisPrompt.includes(r.perspective))
      );
      console.log('📝 Perspectives section preview:', perspectivesSection.substring(0, 200) + '...');
      
      // MORE DETAILED DEBUGGING
      console.log('🔍 DETAILED SYNTHESIS PROMPT:');
      console.log('='.repeat(80));
      console.log(synthesisPrompt);
      console.log('='.repeat(80));
      
      // Include conversation history for context, but filter out system messages AND prism responses
      // to avoid confusion between old and new perspectives
      const cleanConversationHistory = conversationHistory.filter(msg => 
        msg.role !== 'system' && !msg.isPrism
      );
      
      const synthesisConversation = [synthesisMessage, ...cleanConversationHistory];
      
      console.log('🎯 Synthesis conversation structure:', synthesisConversation.map(m => ({ 
        role: m.role, 
        hasContent: !!m.content, 
        contentLength: m.content?.length || 0,
        isPrism: m.isPrism || false
      })));
      
      console.log('🔍 FULL SYNTHESIS CONVERSATION:');
      console.log('='.repeat(80));
      synthesisConversation.forEach((msg, i) => {
        console.log(`Message ${i}: ${msg.role}`);
        console.log(msg.content.substring(0, 500) + '...');
        console.log('-'.repeat(40));
      });
      console.log('='.repeat(80));
      
      const synthesizedResponse = await chatService.sendMessage(synthesisConversation, model);
      return synthesizedResponse;
    } catch (error) {
      console.error('Error synthesizing prism responses:', error);
      throw error;
    }
  }

  // Generate complete prism analysis with perspectives and synthesis
  async generateCompletePrismResponse(userMessage, conversationHistory, prismModel, synthesisModel) {
    console.log('🤖 Using AI to select most relevant prisms...');
    // Use AI to select the most relevant prisms instead of random selection
    const selectedPrisms = await this.selectAIPrisms(userMessage, conversationHistory, prismModel, 5, 8);
    console.log('🔍 AI selected prisms:', selectedPrisms);
    console.log('🚀 Generating prism perspectives in parallel...');
    // Generate responses from each prism perspective (without general system prompt) - in parallel
    const prismResponses = await this.generatePrismResponses(
      userMessage,
      conversationHistory,
      prismModel,
      selectedPrisms
    );
    console.log('✅ All prism perspectives generated, synthesizing response...');
    console.log('📝 Prism responses summary:', prismResponses.map(r => ({
      perspective: r.perspective,
      contentLength: r.content?.length || 0,
      contentPreview: r.content?.substring(0, 100) + '...'
    })));
    
    // Synthesize all perspectives into a final response (with general system prompt)
    const systemPrompt = await getSystemPrompt();
    const synthesizedResponse = await this.synthesizePrismResponses(
      userMessage,
      prismResponses,
      systemPrompt, // Use the loaded system prompt
      synthesisModel || prismModel,
      conversationHistory // Pass conversation history to synthesis
    );
    
    console.log('✨ Synthesis complete:', {
      contentLength: synthesizedResponse.content?.length || 0,
      contentPreview: synthesizedResponse.content?.substring(0, 100) + '...'
    });
    return {
      role: 'assistant',
      content: synthesizedResponse.content,
      isPrism: true,
      perspectives: prismResponses,
      synthesis: synthesizedResponse.content
    };
  }
}

export default new PrismService();
