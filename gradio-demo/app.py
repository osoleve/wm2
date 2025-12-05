"""
Prism Demo - Multi-Perspective AI Analysis
A Gradio demo for analyzing questions through multiple theoretical lenses.
"""

import os
import json
import asyncio
import httpx
import gradio as gr
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

# Configuration
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
DEFAULT_MODEL = "moonshotai/kimi-k2"
GROQ_MODEL = "moonshotai/kimi-k2-instruct"

# All 498 theoretical lenses
PRISM_LENSES = [
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
]


def get_fallback_prompt(lens_name: str) -> str:
    """Generate a fallback prompt if the lens file cannot be loaded."""
    return f"""Persona:
You are a {lens_name} scholar who approaches problems through the lens of {lens_name.lower()}.

Epistemic Stance:
Knowledge emerges through applying {lens_name.lower()} frameworks to understand complex phenomena.

Core Questions:
- How does this phenomenon relate to {lens_name.lower()} theory?
- What insights does {lens_name.lower()} offer for understanding this situation?

Response Character:
Write with expertise in {lens_name.lower()}, bringing unique theoretical insights to bear on the question."""


def load_lens_prompt(lens_name: str, prism_dir: Optional[Path] = None) -> str:
    """Load a lens prompt from the prism directory."""
    if prism_dir is None:
        # Try multiple possible locations
        possible_paths = [
            Path(__file__).parent.parent / "public" / "prism" / f"{lens_name}.txt",
            Path(__file__).parent / "prism" / f"{lens_name}.txt",
            Path("public") / "prism" / f"{lens_name}.txt",
            Path("prism") / f"{lens_name}.txt",
        ]
        for path in possible_paths:
            if path.exists():
                try:
                    return path.read_text()
                except Exception:
                    continue
    else:
        path = prism_dir / f"{lens_name}.txt"
        if path.exists():
            try:
                return path.read_text()
            except Exception:
                pass

    return get_fallback_prompt(lens_name)


async def call_openrouter(messages: list[dict], model: str = DEFAULT_MODEL, temperature: float = 0.7) -> str:
    """Make an API call to OpenRouter."""
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY not set")

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://huggingface.co/spaces",
            },
            json={
                "model": model,
                "messages": messages,
                "temperature": temperature,
            }
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


async def call_groq(messages: list[dict], model: str = GROQ_MODEL, temperature: float = 0.7) -> str:
    """Make an API call to GROQ."""
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY not set")

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": messages,
                "temperature": temperature,
            }
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


async def call_llm(messages: list[dict], provider: str = "openrouter", model: str = None, temperature: float = 0.7) -> str:
    """Call the appropriate LLM provider."""
    if provider == "groq":
        return await call_groq(messages, model or GROQ_MODEL, temperature)
    else:
        return await call_openrouter(messages, model or DEFAULT_MODEL, temperature)


async def select_lenses(question: str, provider: str = "openrouter", model: str = None, min_lenses: int = 5, max_lenses: int = 8) -> list[str]:
    """Use AI to select the most relevant theoretical lenses for a question."""
    selection_prompt = f"""You are a meta-analytical AI that selects the most relevant theoretical lenses for analyzing a given question or topic.

Given the user's message: "{question}"

Available theoretical lenses:
{', '.join(PRISM_LENSES)}

Instructions:
1. Select between {min_lenses} and {max_lenses} theoretical lenses that would provide the most insightful and diverse perspectives on this question
2. Choose lenses that complement each other and offer different angles of analysis
3. Prioritize lenses that are most relevant to the specific content and context of the question
4. Consider both obvious and non-obvious connections that might yield surprising insights
5. Respond with ONLY a JSON array of the selected lens names, exactly as they appear in the list

Example response format:
["Critical Race Theory", "Systems Theory", "Phenomenology", "Queer Theory", "Environmental Justice Framework"]

Your response:"""

    messages = [
        {"role": "system", "content": selection_prompt},
        {"role": "user", "content": question}
    ]

    try:
        response = await call_llm(messages, provider, model)
        selected = json.loads(response.strip())
        # Validate
        valid = [lens for lens in selected if lens in PRISM_LENSES]
        if valid:
            return valid
    except Exception as e:
        print(f"Error in AI lens selection: {e}")

    # Fallback to random selection
    import random
    count = random.randint(min_lenses, max_lenses)
    return random.sample(PRISM_LENSES, count)


async def generate_lens_response(question: str, lens_name: str, provider: str = "openrouter", model: str = None) -> tuple[str, str]:
    """Generate a response from a single lens perspective."""
    lens_prompt = load_lens_prompt(lens_name)

    messages = [
        {"role": "system", "content": lens_prompt},
        {"role": "user", "content": question}
    ]

    try:
        response = await call_llm(messages, provider, model, temperature=0.9)
        return lens_name, response
    except Exception as e:
        return lens_name, f"[Error generating {lens_name} perspective: {str(e)}]"


async def generate_all_lens_responses(question: str, selected_lenses: list[str], provider: str = "openrouter", model: str = None) -> list[tuple[str, str]]:
    """Generate responses from all selected lenses in parallel."""
    tasks = [
        generate_lens_response(question, lens, provider, model)
        for lens in selected_lenses
    ]
    return await asyncio.gather(*tasks)


async def synthesize_responses(question: str, lens_responses: list[tuple[str, str]], provider: str = "openrouter", model: str = None) -> str:
    """Synthesize all lens responses into a coherent final response."""
    perspectives_section = "\n\n---\n\n".join([
        f"**{lens} Perspective:**\n{response}"
        for lens, response in lens_responses
    ])

    synthesis_system = """You are an expert synthesizer who combines multiple theoretical perspectives into coherent, insightful responses.

Your task is to synthesize the multiple perspectives provided into a unified, gestalt response that:
1. Draws on the most compelling insights from each perspective
2. Identifies common themes and productive tensions
3. Provides a nuanced, multi-dimensional understanding
4. Remains accessible and conversational"""

    synthesis_prompt = f"""The user asked: "{question}"

## Perspectives Provided

{perspectives_section}

## Instruction

Synthesize these perspectives into a coherent, insightful response. Write conversationally, weaving together the key insights without rigidly listing each perspective. Remind the reader that they can explore individual perspectives using the tabs below."""

    messages = [
        {"role": "system", "content": synthesis_system},
        {"role": "user", "content": synthesis_prompt}
    ]

    return await call_llm(messages, provider, model)


async def analyze_with_prism(question: str, provider: str = "openrouter", model: str = None, progress=gr.Progress()) -> tuple[str, dict[str, str], list[str]]:
    """
    Main function to analyze a question through the Prism harness.

    Returns:
        - synthesis: The synthesized response
        - lens_responses: Dict mapping lens names to their responses
        - selected_lenses: List of selected lens names
    """
    if not question.strip():
        return "Please enter a question to analyze.", {}, []

    # Check API keys
    if provider == "openrouter" and not OPENROUTER_API_KEY:
        return "Error: OPENROUTER_API_KEY not set. Please configure it in the Space settings.", {}, []
    if provider == "groq" and not GROQ_API_KEY:
        return "Error: GROQ_API_KEY not set. Please configure it in the Space settings.", {}, []

    progress(0.1, desc="Selecting relevant theoretical lenses...")
    selected_lenses = await select_lenses(question, provider, model)

    progress(0.3, desc=f"Generating {len(selected_lenses)} perspective responses...")
    lens_responses_list = await generate_all_lens_responses(question, selected_lenses, provider, model)
    lens_responses = {lens: response for lens, response in lens_responses_list}

    progress(0.8, desc="Synthesizing perspectives...")
    synthesis = await synthesize_responses(question, lens_responses_list, provider, model)

    progress(1.0, desc="Complete!")
    return synthesis, lens_responses, selected_lenses


def create_interface():
    """Create the Gradio interface."""

    with gr.Blocks(
        title="Prism - Multi-Perspective Analysis",
        theme=gr.themes.Soft(
            primary_hue="amber",
            secondary_hue="stone",
        ),
        css="""
        .synthesis-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .lens-tab {
            font-size: 14px;
        }
        .header-text {
            text-align: center;
            margin-bottom: 20px;
        }
        """
    ) as demo:
        gr.Markdown(
            """
            # Prism - Multi-Perspective AI Analysis

            Ask any question and receive an analysis through multiple theoretical lenses.
            The AI selects 5-8 relevant perspectives from **498 theoretical frameworks**,
            generates responses from each, then synthesizes them into a coherent answer.

            *Explore individual lens responses using the tabs below the synthesis.*
            """,
            elem_classes=["header-text"]
        )

        with gr.Row():
            with gr.Column(scale=3):
                question_input = gr.Textbox(
                    label="Your Question",
                    placeholder="Enter a question to analyze through multiple theoretical lenses...",
                    lines=3,
                    max_lines=6
                )
            with gr.Column(scale=1):
                provider_select = gr.Dropdown(
                    choices=["openrouter", "groq"],
                    value="openrouter",
                    label="API Provider"
                )
                model_input = gr.Textbox(
                    label="Model (optional)",
                    placeholder="Leave blank for default",
                    value=""
                )
                submit_btn = gr.Button("Analyze", variant="primary", size="lg")

        # Status and selected lenses
        with gr.Row():
            selected_lenses_display = gr.Textbox(
                label="Selected Lenses",
                interactive=False,
                lines=1
            )

        # Synthesis output
        synthesis_output = gr.Markdown(
            label="Synthesis",
            elem_classes=["synthesis-box"]
        )

        # Individual lens responses in tabs
        gr.Markdown("## Individual Lens Responses")

        # We'll use an Accordion for individual responses since tabs are dynamic
        lens_accordion = gr.Accordion("Click to expand individual lens responses", open=False)

        with lens_accordion:
            lens_responses_display = gr.JSON(
                label="Lens Responses",
                visible=False
            )
            lens_markdown = gr.Markdown()

        # State to store lens responses
        lens_state = gr.State({})
        selected_state = gr.State([])

        def format_lens_responses(lens_responses: dict) -> str:
            """Format lens responses as markdown."""
            if not lens_responses:
                return ""

            output = []
            for lens, response in lens_responses.items():
                output.append(f"### {lens}\n\n{response}\n\n---\n")
            return "\n".join(output)

        async def run_analysis(question, provider, model, progress=gr.Progress()):
            """Run the prism analysis and return formatted results."""
            model_to_use = model if model.strip() else None
            synthesis, lens_responses, selected = await analyze_with_prism(
                question, provider, model_to_use, progress
            )

            selected_text = ", ".join(selected) if selected else "None"
            formatted_responses = format_lens_responses(lens_responses)

            return (
                synthesis,
                selected_text,
                formatted_responses,
                lens_responses,
                selected
            )

        submit_btn.click(
            fn=run_analysis,
            inputs=[question_input, provider_select, model_input],
            outputs=[
                synthesis_output,
                selected_lenses_display,
                lens_markdown,
                lens_state,
                selected_state
            ]
        )

        # Also trigger on Enter in the question input
        question_input.submit(
            fn=run_analysis,
            inputs=[question_input, provider_select, model_input],
            outputs=[
                synthesis_output,
                selected_lenses_display,
                lens_markdown,
                lens_state,
                selected_state
            ]
        )

        gr.Markdown(
            """
            ---
            ### About Prism

            Prism analyzes questions through multiple theoretical frameworks simultaneously,
            providing a richer, more nuanced understanding than any single perspective could offer.

            The 498 available lenses span philosophy, social sciences, critical theory,
            cultural studies, economics, psychology, and more.

            **API Keys Required:** Set `OPENROUTER_API_KEY` or `GROQ_API_KEY` in your Space settings.
            """
        )

    return demo


if __name__ == "__main__":
    demo = create_interface()
    demo.launch()
